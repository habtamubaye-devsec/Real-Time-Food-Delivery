const Joi = require("joi");

exports.registerUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^\+?\d{10,13}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number",
      "any.required": "Phone number is required",
    }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be atleast 8 characters",
    "any.required": "Password is required",
  }),
  role: Joi.valid("customer", "restaurant", "driver", "admin")
    .messages({
      "any.only": "Invalid role",
      "any.required": "Role is required",
    }),
  restaurantId: Joi.string().when("role", {
    is: "driver",
    then: Joi.required().messages({
      "any.required": "Restaurant ID is required for drivers.",
    }),
    otherwise: Joi.optional(),
  }),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^\+?\d{10,13}$/)
    .optional(),
  password: Joi.string().min(8).required(),
}).or("email", "phone");

exports.otpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?\d{10,13}$/)
    .required(),
  otp: Joi.string().length(6).required(),
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+?\d{10,13}$/)
    .required(),
});

exports.resetPasswordSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?\d{10,13}$/)
    .required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});
