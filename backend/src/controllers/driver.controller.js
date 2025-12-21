const User = require("../models/Users");  
const Order = require("../models/Order");
const DriverLocation = require("../models/DriverLocation");
const logger = require("../utils/logger");
const mongoose = require("mongoose");
const registerDriver = async (req, res) => {
    try {
        const { email, phone, password, name, restaurantId } = req.body;

        // Check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) return res.status(400).json({ message: "Driver already exists" });

        // Create user
        const user = await User.create({ email, phone, password, role: "driver", restaurantId });
        res.status(201).json({ status: "success", data: { user } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
const currentLocation = async (req, res) => {
    try {
        const driverId = await req.params.driverId;
        const { latitude, longitude } = req.body;
        const driver = await DriverLocation.findById(driverId);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        driver.location = {
            type: "Point",
            coordinates: [longitude, latitude]
        };
        await driver.save();
        res.status(200).json({ status: "success", data: { driver } });
    } catch (error) {
        logger.error(`Error updating driver location: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
const getCurrentLocation = async (req, res) => {
    try {
        const driverId = await req.params.driverId;
        const driver = await DriverLocation.findById(driverId);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        res.status(200).json({ status: "success", data: { currentLocation: driver.location } });
    } catch (error) {
        logger.error(`Error fetching driver location: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
const driverOrders = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Find driver
    const driver = await User.findById(driverId).select("-password");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Find orders
    const orders = await Order.find({
      driverId: new mongoose.Types.ObjectId(driverId),
      deleted: false,
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this driver" });
    }

    res.status(200).json({ status: "success", data: { driver, orders } });
  } catch (error) {
    logger.error(`Error fetching driver orders: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
const changeDriverStatus = async (req, res) => {
    try {
        const driver = await User.findById(req.user._id);
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        const validStatuses = ["available", "unavailable"];
        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        driver.status = req.body.status;
        await driver.save();

        res.status(200).json({ status: "success", data: { driver } });
    } catch (error) {
       logger.error(`Error changing driver status: ${error.message}`);
       res.status(500).json({ message: error.message });
    }
}

const dailyAndTotalEarning = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await User.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // Date ranges
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    // Only count delivered orders
    const orderFilter = {
      driverId,
      deleted: false,
      status: "delivered",
    };

    const [todaysOrderCount, weeklyOrderCount, totalOrderCount] =
      await Promise.all([
        Order.countDocuments({
          ...orderFilter,
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        }),

        Order.countDocuments({
          ...orderFilter,
          createdAt: { $gte: startOfWeek, $lt: new Date() },
        }),

        Order.countDocuments(orderFilter),
      ]);

    const earningPerOrder = 150;

    res.status(200).json({
      status: "success",
      data: {
        todaysOrderCount,
        todayEarnings: todaysOrderCount * earningPerOrder,
        weeklyEarning: weeklyOrderCount * earningPerOrder,
        totalEarnings: totalOrderCount * earningPerOrder,
      },
    });
  } catch (error) {
    logger.error(`Error fetching driver earnings: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    registerDriver,
    driverOrders,
    currentLocation,
    getCurrentLocation,
    changeDriverStatus,
    dailyAndTotalEarning
}