const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const logger = require("../utils/logger");

const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    req.user = user;
    next();

  } catch (error) {
    logger.error(`Auth error: ${error.message}`);

    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;
