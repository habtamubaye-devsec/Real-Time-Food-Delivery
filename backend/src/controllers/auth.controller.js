const User = require("../models/Users");
const Restaurant = require("../models/Restaurant");
const { generateToken, refreshToken } = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const { sendOTP, verifyOTP } = require("../utils/afroMessage");
const { setOtp, getOtp, deleteOtp } = require("../utils/otpStore");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const { ref } = require("joi");

const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
};

exports.googleCallback = async (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const user = req.user;

    if (!user) {
      return res.redirect(`${clientUrl}/login?error=google`);
    }

    // clear stored role hint
    if (req.session) req.session.oauthRole = undefined;

    const token = generateToken(user);
    const refreshTokenValue = refreshToken(user);

    await User.updateOne(
      { _id: user._id },
      { refreshToken: refreshTokenValue }
    );

    res.cookie("token", token, cookieOptions());
    res.cookie("refreshToken", refreshTokenValue, cookieOptions());

    // Redirect based on actual role
    if (user.role === "admin") return res.redirect(`${clientUrl}/pending`);
    if (user.role === "restaurant") return res.redirect(`${clientUrl}/restaurant/menu`);
    if (user.role === "driver") return res.redirect(`${clientUrl}/driver/orders/${user._id}`);
    return res.redirect(`${clientUrl}/nearby`);
  } catch (err) {
    logger.error(err.message);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?error=google_server`);
  }
};

exports.register = async (req, res) => {
  try {
    const { email, phone, password, restaurantId, role } = req.body;
    const userExist = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExist)
      return res.status(400).json({ message: "User alreaady exists" });

    const user = await User.create({
      email,
      phone,
      password,
      restaurantId,
      role,
    });

    const { verificationCode, code } = await sendOTP(phone);

    try {
      await setOtp(phone, { code, verificationCode }, 300);
    } catch (err) {
      logger.error(`OTP store error: ${err.message}`);
    }

    res.status(200).json({
      status: "success",
      data: { userid: user._id, role: user.role },
    });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    console.log(phone, otp);
    const stored = await getOtp(phone);
    console.log(stored);
    if (!stored) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    const { code, verificationCode } = stored;
    const isvalid = await verifyOTP(phone, verificationCode, otp);
    if (!isvalid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await deleteOtp(phone);

    const user = await User.findOneAndUpdate(
      { phone },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // // If this is a restaurant account, also mark its Restaurant profile as verified.
    // // The public restaurant listing filters by Restaurant.verified.
    // if (user.role === "restaurant") {
    //   await Restaurant.updateOne(
    //     { ownerId: user._id },
    //     { $set: { verified: true } }
    //   );
    // }

    const token = generateToken(user);
    const refreshTokenn = refreshToken(user);
    logger.info(refreshTokenn);
    await User.updateOne({ _id: user._id }, { refreshToken: refreshTokenn });

    res.cookie("token", token, cookieOptions());
    res.cookie("refreshToken", refreshTokenn, cookieOptions());
    res
      .status(200)

      .json({ status: "success", data: { userId: user._id, role: user.role } });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    // If no user found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If phone not verified, send OTP and stop login process
    if (!user.isVerified) {
      const { verificationCode, code } = await sendOTP(user.phone);
      await setOtp(user.phone, { code, verificationCode }, 300); // 5 minutes
      return res.status(403).json({
        message: "Please verify your phone number first.",
      });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshTokenValue = refreshToken(user);

    // Save refresh token in DB
    await User.updateOne(
      { _id: user._id },
      { refreshToken: refreshTokenValue }
    );

    // Set cookies
    // Set cookies
    res.cookie("token", token, cookieOptions());
    res.cookie("refreshToken", refreshTokenValue, cookieOptions());

    // Prepare response data
    let responseData = { userId: user._id, role: user.role };

    // If restaurant, fetch restaurantId
    if (user.role === "restaurant") {
      const restaurant = await require("../models/Restaurant").findOne({
        ownerId: user._id,
      });
      if (restaurant) {
        responseData.restaurantId = restaurant._id;
      }
    }

    // Send success response
    res.status(200).json({
      token,
      status: "success",
      data: responseData,
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Fetch full user
    const user = await User.findOne({ _id: decoded.id });
    if (!user)
      return res.status(401).json({ message: "Invalid refresh token" });

    // Basic integrity check: refresh token must match what we last issued
    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Prepare response
    let responseData = { userId: user._id, role: user.role };
    if (user.role === "restaurant") {
      const restaurant = await require("../models/Restaurant").findOne({ ownerId: user._id });
      if (restaurant) responseData.restaurantId = restaurant._id;
    }

    const newAccessToken = generateToken(user);

    res.cookie("token", newAccessToken, {
      ...cookieOptions(),
    });

    res.status(200).json({ status: "success", data: responseData });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: "Invalid refresh token" });
  }
};
exports.logout = (req, res) => {
  res.clearCookie("token", cookieOptions());
  res.clearCookie("refreshToken", cookieOptions());
  return res.status(200).json({ status: "success" });
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "User with given email doesn't exist" });
    }

    const { verificationCode, code } = await sendOTP(user.phone);
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordToken = code;
    user.resetPasswordExpires = otpExpiration;

    await user.save();
    res.status(200).json({
      status: "success",
      message: "OTP sent to your phone",
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body;
    const user = await User.findOne({
      phone,
      resetPasswordToken: code,
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
