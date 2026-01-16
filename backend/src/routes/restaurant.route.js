const express = require("express");
const protect = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo");
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  addMenuItem,
  deleteMenuItem,
  updateMenuItem,
  registerRestaurant,
  getMenus,
  getMenuItem,
  updateInventory,
  restaurantStats,
  getAllOrder,
  getOrderById,
  inviteDriver,
  assignDriverToOrder,
  activeDrivers,
  restaurantOrderStat
} = require("../controllers/restaurant.controller");



router.post("/register", registerRestaurant);
router.post("/invite-driver", protect, restrictTo('restaurant'), inviteDriver);
router.post("/assign-driver", protect, restrictTo('restaurant'), assignDriverToOrder);
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);
router.post("/:restaurantId/menu", protect, restrictTo('restaurant'), addMenuItem);
router.delete("/:restaurantId/menu/:itemId", protect, restrictTo('restaurant', 'admin'), deleteMenuItem);
router.put("/:restaurantId/menu/:itemId", protect, restrictTo('restaurant'), updateMenuItem);
router.get("/:restaurantId/menu", getMenus);
router.get("/:restaurantId/menu/:itemId", getMenuItem);
router.put("/:restaurantId/inventory", protect, restrictTo('restaurant'), updateInventory);
router.get("/:restaurantId/stats", protect, restrictTo('restaurant', 'admin'), restaurantStats);
router.get("/:restaurantId/active-drivers", protect, restrictTo('restaurant'), activeDrivers);
router.get("/:restaurantId/orders", protect, restrictTo('restaurant', 'admin'), getAllOrder);
router.get("/:restaurantId/orders/:orderId", protect, restrictTo('restaurant', 'admin'), getOrderById);
router.get("/:restaurantId/order-stats", protect, restrictTo('restaurant', 'admin'), restaurantOrderStat);
module.exports = router;
