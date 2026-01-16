const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const DriverLocation = require("../models/DriverLocation");
const logger = require("../utils/logger");

const parseCookieHeader = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rest.join("="));
    acc[key] = value;
    return acc;
  }, {});
};

const getUserFromSocket = async (socket) => {
  const cookies = parseCookieHeader(socket.handshake?.headers?.cookie);
  const token = cookies.token;
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  return user || null;
};

const canJoinOrderRoom = async ({ user, orderId }) => {
  const order = await Order.findById(orderId);
  if (!order) return { ok: false, reason: "Order not found" };

  if (user.role === "admin") return { ok: true, order };

  if (user.role === "customer" && order.customerId?.toString() === user._id.toString()) {
    return { ok: true, order };
  }

  if (user.role === "driver" && order.driverId?.toString() === user._id.toString()) {
    return { ok: true, order };
  }

  if (user.role === "restaurant") {
    const restaurant = await Restaurant.findOne({ ownerId: user._id });
    if (restaurant && order.restaurantId?.toString() === restaurant._id.toString()) {
      return { ok: true, order };
    }
  }

  return { ok: false, reason: "Not authorized for this order" };
};

const upsertDriverLocation = async ({ driverId, latitude, longitude }) => {
  const now = new Date();
  return DriverLocation.findOneAndUpdate(
    { driverId },
    {
      $set: {
        driverId,
        location: { type: "Point", coordinates: [longitude, latitude] },
        updatedAt: now,
      },
    },
    { upsert: true, new: true }
  );
};

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const user = await getUserFromSocket(socket);
      if (!user) return next(new Error("Unauthorized"));
      socket.data.user = {
        id: user._id.toString(),
        role: user.role,
      };
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const { id, role } = socket.data.user;

    try {
      if (role === "driver") {
        socket.join(`driver:${id}`);
      }

      if (role === "admin") {
        socket.join("admins");
      }

      if (role === "restaurant") {
        const restaurant = await Restaurant.findOne({ ownerId: id });
        if (restaurant) socket.join(`restaurant:${restaurant._id.toString()}`);
      }
    } catch (err) {
      logger.error(`Socket join error: ${err.message}`);
    }

    socket.on("tracking:join:order", async ({ orderId }, ack) => {
      try {
        const user = await User.findById(id);
        const { ok, reason } = await canJoinOrderRoom({ user, orderId });
        if (!ok) {
          if (typeof ack === "function") ack({ success: false, message: reason });
          return;
        }
        socket.join(`order:${orderId}`);
        if (typeof ack === "function") ack({ success: true });
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, message: err.message });
      }
    });

    socket.on("tracking:join:restaurant", async ({ restaurantId }, ack) => {
      try {
        const user = await User.findById(id);
        if (!user) {
          if (typeof ack === "function") ack({ success: false, message: "Unauthorized" });
          return;
        }

        if (user.role === "admin") {
          socket.join(`restaurant:${restaurantId}`);
          if (typeof ack === "function") ack({ success: true });
          return;
        }

        if (user.role !== "restaurant") {
          if (typeof ack === "function") ack({ success: false, message: "Not authorized" });
          return;
        }

        const restaurant = await Restaurant.findOne({ ownerId: user._id });
        if (!restaurant) {
          if (typeof ack === "function") ack({ success: false, message: "Restaurant not found" });
          return;
        }

        if (restaurant._id.toString() !== String(restaurantId)) {
          if (typeof ack === "function") ack({ success: false, message: "Not authorized" });
          return;
        }

        socket.join(`restaurant:${restaurant._id.toString()}`);
        if (typeof ack === "function") ack({ success: true });
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, message: err.message });
      }
    });

    socket.on("tracking:join:driver", async ({ driverId }, ack) => {
      try {
        const user = await User.findById(id);
        if (!user) {
          if (typeof ack === "function") ack({ success: false, message: "Unauthorized" });
          return;
        }

        if (user.role === "admin") {
          socket.join(`driver:${driverId}`);
          if (typeof ack === "function") ack({ success: true });
          return;
        }

        if (user.role === "restaurant") {
          const driver = await User.findById(driverId);
          const restaurant = await Restaurant.findOne({ ownerId: user._id });
          if (!driver || driver.role !== "driver" || !restaurant) {
            if (typeof ack === "function") ack({ success: false, message: "Not found" });
            return;
          }
          if (driver.restaurantId?.toString() !== restaurant._id.toString()) {
            if (typeof ack === "function") ack({ success: false, message: "Not authorized" });
            return;
          }
          socket.join(`driver:${driverId}`);
          if (typeof ack === "function") ack({ success: true });
          return;
        }

        if (typeof ack === "function") ack({ success: false, message: "Not authorized" });
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, message: err.message });
      }
    });

    socket.on("driver:location:update", async (payload, ack) => {
      try {
        const user = await User.findById(id);
        if (!user || user.role !== "driver") {
          if (typeof ack === "function") ack({ success: false, message: "Not authorized" });
          return;
        }

        const latitude = Number(payload?.latitude);
        const longitude = Number(payload?.longitude);
        const orderId = payload?.orderId;

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          if (typeof ack === "function") ack({ success: false, message: "Invalid coordinates" });
          return;
        }

        await upsertDriverLocation({
          driverId: user._id,
          latitude,
          longitude,
        });

        const event = {
          driverId: user._id.toString(),
          location: { latitude, longitude },
          updatedAt: new Date().toISOString(),
          orderId: orderId || null,
        };

        io.to(`driver:${user._id.toString()}`).emit("driver:location", event);
        io.to("admins").emit("driver:location", event);

        if (user.restaurantId) {
          io.to(`restaurant:${user.restaurantId.toString()}`).emit("driver:location", event);
        }

        if (orderId) {
          const { ok } = await canJoinOrderRoom({ user, orderId });
          // For driver emitting, this check ensures driver is assigned
          if (ok) io.to(`order:${orderId}`).emit("driver:location", event);
        }

        if (typeof ack === "function") ack({ success: true });
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, message: err.message });
      }
    });

    socket.on("disconnect", () => {
      // no-op
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
