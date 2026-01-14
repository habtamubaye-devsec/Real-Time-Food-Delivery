const Cart = require("../models/Cart");
const Joi = require("joi");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const { client: redisClient } = require("../config/redis");
const { getIO } = require("../realtime/socket");
const logger = require("../utils/logger");

// Joi schema for order history query (pagination only)
const orderQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({ "number.min": "Page must be atleast 1." }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot excees 100",
  }),
});
exports.createOrder = async (req, res) => {
  try {
    const { deliveryLocation, paymentMethod } = req.body;
    const cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart)
      return res.status(404).json({ message: "Cart is empty or not found" });

    const restaurant = await Restaurant.findOne({
      _id: cart.restaurantId,
    });
    logger.info("Cart items:", cart.items, "Total:", cart.total);

    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    for (const item of cart.items) {
      const menuItem = restaurant.menu.id(item.menuItemId);
      if (!menuItem || !menuItem.inStock || menuItem.price !== item.price) {
        return res.status(400).json({
          message: `Menu item ${item.name} is unavailable or price is changed`,
        });
      }
    }
    let total = cart.total;
    if (!total) {
      total = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    }
    const order = new Order({
      customerId: req.user._id,
      restaurantId: cart.restaurantId,
      items: cart.items,
      total,
      deliveryLocation,
      paymentMethod,
      status: "pending",
    });

    await order.save();
    await Cart.deleteOne({ customerId: req.user._id }); // clear cart
    await redisClient.del(`cart:${req.user._id}`);
    // await redisClient.del(`orders:${cart.restaurantId}`);

    // Emit socket event
    try {
      const io = getIO();
      if (io) {
        io.to(`restaurant:${cart.restaurantId}`).emit("order:created", order);
        io.to("admins").emit("order:created", order);
      }
    } catch (e) {
      logger.error(`Socket emit error: ${e.message}`);
    }

    res.status(200).json({ message: "success", data: order });
  } catch (err) {
    logger.error(`Error creating the order: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const { error, value } = orderQuerySchema.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((err) => err.message),
      });
    }

    const { page, limit } = value;
    const skip = (page - 1) * limit;
    const userID = req.user.id;
    const role = req.user.role;

    let query = {};
    if (role === "customer") query.customerId = userID;
    else if (role === "restaurant") {
      const restaurant = await Restaurant.findOne({ ownerId: userID }).select(
        "_id"
      );
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      query.restaurantId = restaurant._id;
    }

    const orders = await Order.find(query)
      .select(
        "customerId restaurantId items total status deliveryLocation paymentMethod createdAt updatedAt driverId"
      )
      .populate("customerId", "email")
      .populate("restaurantId", "name")
      .populate("driverId", "_id name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({
      message: "Orders retrived successfully",
      data: { total, page, limit, orders },
    });
  } catch (err) {
    logger.error(`Error fetching orders: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .select(
        "customerId restaurantId items total status deliveryLocation paymentMethod createdAt updatedAt driverId"
      )
      .populate("customerId", "email")
      .populate("restaurantId", "name")
      .populate("driverId", "_id name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = req.user._id.toString();
    const role = req.user.role;

    if (role === "admin") {
      return res.status(200).json({ message: "Order retrieved", data: order });
    }

    if (role === "customer") {
      if (order.customerId?._id?.toString?.() === userId) {
        return res.status(200).json({ message: "Order retrieved", data: order });
      }
      return res.status(403).json({ message: "Not authorized" });
    }

    if (role === "driver") {
      if (order.driverId?._id?.toString?.() === userId) {
        return res.status(200).json({ message: "Order retrieved", data: order });
      }
      return res.status(403).json({ message: "Not authorized" });
    }

    if (role === "restaurant") {
      const restaurant = await Restaurant.findOne({ ownerId: req.user._id }).select("_id");
      if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
      if (order.restaurantId?._id?.toString?.() === restaurant._id.toString()) {
        return res.status(200).json({ message: "Order retrieved", data: order });
      }
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.status(403).json({ message: "Not authorized" });
  } catch (err) {
    logger.error(`Error fetching order by id: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "picked",
      "en_route",
      "delivered",
      "canceled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    // Authorization
    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({
        ownerId: req.user._id,
      }).select("_id");
      if (!restaurant) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (order.restaurantId.toString() !== restaurant._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    } else if (req.user.role === "driver") {
      if (
        !order.driverId ||
        order.driverId.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    order.status = status;
    await order.save();

    // socket emit
    try {
      const io = getIO();
      // Notify customer
      io.to(`order:${orderId}`).emit("order:updated", order);
      // Notify restaurant (if status changed by driver/admin)
      io.to(`restaurant:${order.restaurantId}`).emit("order:updated", order);
      // Notify driver (if status changed by restaurant)
      if (order.driverId) {
        io.to(`driver:${order.driverId}`).emit("order:updated", order);
      }
    } catch (e) {
      logger.error(`Socket emit error: ${e.message}`);
    }

    res.status(200).json({ message: "Order status updated", data: order });
  } catch (err) {
    logger.error(`Error changing order status: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

exports.storeFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.customerId.toString() !== req.user._id.toString()) {
      throw new Error(
        "Forbidden: You can only provide feedback for your own orders"
      );
    }

    if (order.status !== "delivered") {
      throw new Error("Feedback can only be provided for delivered orders");
    }

    order.rating = rating;
    order.feedback = comment;
    await order.save();

    res.status(200).json({ message: "success", data: order });
  } catch (err) {
    logger.error(`Error storing feedback: ${err.message}`);
    res.status(500).json({ messge: "Server error" });
  }
};
