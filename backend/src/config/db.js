const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected successfully!");
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    } else {
      throw err;
    }
  }
};

module.exports = connectDB;
