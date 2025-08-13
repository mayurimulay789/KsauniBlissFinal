const express = require("express");
const { validateCoupon, getAvailableCoupons } = require("../controllers/couponController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validate coupon
router.post("/validate", validateCoupon);

// Get available coupons
router.get("/available", getAvailableCoupons);

module.exports = router;
