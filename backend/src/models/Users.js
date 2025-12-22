const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { required } = require("joi");


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  phone: { type: String, unique: true, trim: true, required: true },
  password: { type: String, minlength: 8, required: true },
  role: {
    type: String,
    enum: ["customer", "restaurant", "driver", "admin"],
    default: "customer",
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: function () {
      return this.role === "driver";
    },
  },
  status: {
    type: String,
    enum: ["available", "unavailable"],
    default: "unavailable",
    required: function () {
      return this.role === "driver";
    },
  },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  googleId: { type: String },
  isVerified: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  refreshToken: { type: String },
});

userSchema.index({ role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

module.exports = mongoose.model("User", userSchema);
