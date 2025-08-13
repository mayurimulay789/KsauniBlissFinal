const Coupon = require("../models/Coupon")

// Validate Coupon
const validateCoupon = async (req, res) => {
  try {
    const { code, orderValue } = req.body
    const userId = req.user.userId

    if (!code || !orderValue) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and order value are required",
      })
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() })

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      })
    }

    // Check if coupon is valid for user
    const validation = coupon.isValidForUser(userId)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      })
    }

    // Check minimum order value
    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
      })
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderValue)

    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        minOrderValue: coupon.minOrderValue,
      },
    })
  } catch (error) {
    console.error("Validate coupon error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
    })
  }
}

// Get Available Coupons for User
const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user.userId
    const now = new Date()

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [{ maxUses: null }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }],
    }).select("code description discountType discountValue minOrderValue maxDiscountAmount validUntil")

    // Filter coupons based on user usage
    const availableCoupons = coupons.filter((coupon) => {
      const userUsage = coupon.usedBy.find((usage) => usage.user.toString() === userId)
      return !userUsage || userUsage.usedCount < coupon.maxUsesPerUser
    })

    res.status(200).json({
      success: true,
      coupons: availableCoupons,
    })
  } catch (error) {
    console.error("Get available coupons error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch available coupons",
    })
  }
}

module.exports = {
  validateCoupon,
  getAvailableCoupons,
}
