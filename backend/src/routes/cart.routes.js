const express = require("express");
const {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  deleteCart,
} = require("../controllers/cart.controllers");
const {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
} = require("../validators/cartValidator");
const protect = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo");

const router = express.Router();

router.get("/getCart", protect, getCart);
router.post("/addToCart", protect, restrictTo("customer"), validateAddToCart, addToCart);
router.put("/updateCart/:id", protect, restrictTo("customer"), validateUpdateCartItem, updateCartItem);
router.delete("/deleteCart/:restaurantId", protect, deleteCart);
router.delete(
  "/removeFromCart/:id",
  protect,
  restrictTo("customer"),
  validateRemoveFromCart,
  removeFromCart
);

module.exports = router;
