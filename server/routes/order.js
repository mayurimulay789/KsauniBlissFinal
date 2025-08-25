const express = require("express");
const {
  createRazorpayOrder,
  placeCodOrder,
  verifyPaymentAndCreateOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  trackOrder,
  getShippingRates,
  fetchAndSetTrackingInfo
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Shipping rates route - moved to top for better organization
router.post('/shipping-rates', getShippingRates)
router.post('/trackingOrder', fetchAndSetTrackingInfo)

// Order creation routes
router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/cod", placeCodOrder);
router.post("/verify-payment", verifyPaymentAndCreateOrder);

// Order management routes
router.get("/my-orders", getUserOrders);
router.get("/:orderId", getOrderDetails);
router.get("/:orderId/track", trackOrder);
router.put("/:orderId/cancel", cancelOrder);

module.exports = router;
