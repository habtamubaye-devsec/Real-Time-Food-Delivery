const Joi = require("joi");
const JoiObjectID = require("joi-objectid")(Joi);

const addToCartSchema = Joi.object({
  menuItemId: JoiObjectID().required().messages({
    "string.pattern.base": "Valid menu item id is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be atleast 1",
    "any.required": "Quantity is required",
  }),
  restaurantId: JoiObjectID().required().messages({
    "string.pattern.base": "Valid restaurant ID required",
  }),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});

const removeFromCartSchema = Joi.object({
  itemId: JoiObjectID().required().messages({
    "string.pattern.base": "Valid item ID required",
  }),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body || req.params, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }
  next();
};

module.exports = {
  validateAddToCart: validate(addToCartSchema),
  validateUpdateCartItem: validate(updateCartItemSchema),
  validateRemoveFromCart: validate(removeFromCartSchema),
};
