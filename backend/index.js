require("dotenv").config();
const express = require("express");
const session = require("express-session");
// fixed routes
const authRoutes = require("./src/routes/auth.Routes");
const restaurantRoutes = require("./src/routes/restaurant.route");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

const adminRoutes = require("./src/routes/admin.routes");
const cartRoutes = require("./src/routes/cart.routes");
const orderRoutes = require("./src/routes/order.routes");

const driverRoutes = require("./src/routes/driver.routes");
const userRoutes = require("./src/routes/user.routes");

const cors = require("cors");
const connectDB = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");
const logger = require("./src/utils/logger");
const cookieParser = require("cookie-parser");
const passport = require("./src/config/passport");

const app = express();

// Middlewares

//frontend make the frontend work on port 3000
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
// Connect to MongoDB and Redis
Promise.all([connectDB(), connectRedis()]).catch((err) => {
  logger.error(`Startup error: ${err.message}`);
  if (process.env.NODE_ENV !== "test")
    return process.exit(1); // Exit process with failure
  else throw err; // Rethrow error in test environment
});


// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/api/delivery/auth", authRoutes);
// // Backward-compatible alias (some Google callback URLs may still point here)
// app.use("/api/auth", authRoutes);
app.use("/api/delivery/admin", adminRoutes);
app.use("/api/delivery/customer", cartRoutes);

app.use("/api/delivery/restaurants", restaurantRoutes);

app.use("/api/delivery/orders", orderRoutes);

app.use("/api/delivery/drivers", driverRoutes);
app.use("/api/delivery/users", userRoutes);
// Error handling
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
