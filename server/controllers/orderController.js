const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const shiprocketService = require("../services/shiprocketService");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Enhanced Shiprocket integration function
const createShiprocketOrder = async (order) => {
  try {
    console.log(
      "🚀 Starting Shiprocket order creation for:",
      order.orderNumber
    );

    // Check if Shiprocket service is properly configured
    if (
      !shiprocketService ||
      !process.env.SHIPROCKET_EMAIL ||
      !process.env.SHIPROCKET_PASSWORD
    ) {
      console.log("⚠️ Shiprocket service not configured, skipping integration");
      return {
        success: false,
        error: "Shiprocket service not configured",
      };
    }

    // Create order on Shiprocket
    const shiprocketOrderResponse = await shiprocketService.createOrder(order);

    if (shiprocketOrderResponse.status_code === 1) {
      const shipmentId = shiprocketOrderResponse.shipment_id;

      // Assign AWB to shipment
      const AWBResponse = await shiprocketService.assignAwb(
        shipmentId,
        order.courier_company_id
      );

      if (AWBResponse.status_code === 200) {
        // Update order with Shiprocket details
        order.trackingInfo = {
          trackingNumber: AWBResponse.awb_code,
          carrier: AWBResponse.courier_name || "Shiprocket",
          shiprocketOrderId: shiprocketOrderResponse.order_id,
          shipmentId: AWBResponse.shipment_id,
          trackingUrl: `https://shiprocket.co/tracking/${AWBResponse.awb_code}`,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          currentStatus: "Order Confirmed",
          lastUpdate: new Date(),
        };
        await order.save();
        console.log("✅ Shiprocket integration completed successfully");
        return {
          success: true,
          trackingNumber: AWBResponse.awb_code,
          shiprocketOrderId: shiprocketOrderResponse.order_id,
        };
      }
    }
    throw new Error("Failed to create shipment");
  } catch (error) {
    console.error("❌ Shiprocket integration failed:", error.message);
    // Update order with error info but don't fail the order
    order.trackingInfo = {
      carrier: "Manual Processing",
      currentStatus: "Order Confirmed - Manual Processing",
      lastUpdate: new Date(),
      error: error.message,
    };
    await order.save();
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, shippingAddress, couponCode, selectedShippingRate } =
      req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phoneNumber ||
      !shippingAddress.pinCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    if (!selectedShippingRate) {
      return res.status(400).json({
        success: false,
        message: "Please select Shipping method",
      });
    }

    // Validate and calculate order total
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color || "Default",
        image: product.images[0]?.url,
      });
    }

    // Apply coupon logic
    let discount = 0;
    let couponDetails = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon && new Date() <= coupon.validUntil) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === "percentage") {
            discount = Math.min(
              (subtotal * coupon.discountValue) / 100,
              coupon.maxDiscountAmount || discount
            );
          } else {
            discount = coupon.discountValue;
          }
          couponDetails = {
            code: coupon.code,
            discountAmount: discount,
            discountType: coupon.discountType,
          };
        }
      }
    }

    const shiprocketCharges = selectedShippingRate.freight_charge;
    // Calculate final amounts - Updated free shipping threshold to 399
    const shippingCharges = subtotal >= 399 ? 0 : 99;
    const tax = 0;
    // const total = Math.round(
    //   subtotal + shippingCharges - discount + shiprocketCharges
    // );
    const total=1

    // Generate order number
    const orderNumber = `FH-${Date.now()}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId,
        couponCode: couponCode || "",
      },
    });


    // Store temporary order data
    const tempOrderData = {
      user: userId,
      orderNumber,
      items: validatedItems.map(({ _id, __v, ...rest }) => rest),
      shippingAddress,
      pricing: { subtotal, shippingCharges, tax, discount, total },
      coupon: couponDetails,
      paymentInfo: {
        razorpayOrderId: razorpayOrder.id,
        paymentMethod: "Online",
        paymentStatus: "pending",
      },
      status: "pending",
      createdAt: new Date(),
    };

    // Store in user's temp data
    await User.findByIdAndUpdate(userId, { tempOrderData }, { new: true });

    res.status(200).json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      orderSummary: {
        orderNumber,
        total,
        items: validatedItems.length,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// Enhanced payment verification with better Shiprocket integration
const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.userId;

    // 1️⃣ Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2️⃣ Fetch temp order data from User
    const user = await User.findById(userId).lean();
    if (!user?.tempOrderData) {
      return res.status(400).json({ success: false, message: "Order data not found" });
    }

    // Remove _id and __v from orderData
    const { _id, __v, ...orderDataWithoutId } = user.tempOrderData;

    // Also remove _id from each item
    orderDataWithoutId.items = orderDataWithoutId.items.map(({ _id, __v, ...rest }) => rest);

    // 3️⃣ Update payment info
    orderDataWithoutId.paymentInfo = {
      ...orderDataWithoutId.paymentInfo,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: "completed",
      paidAt: new Date(),
    };
    orderDataWithoutId.status = "confirmed";

    // 4️⃣ Create final order in DB (new _id will be generated)
    const order = await Order.create(orderDataWithoutId);

    // 5️⃣ Update product stock
    await Promise.all(order.items.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    ));

    // 6️⃣ Update coupon usage (if applied)
    if (order.coupon?.code) {
      const coupon = await Coupon.findOne({ code: order.coupon.code });
      if (coupon) {
        coupon.usedCount += 1;
        const userUsage = coupon.usedBy.find(u => u.user.toString() === userId);
        if (userUsage) {
          userUsage.usedCount += 1;
          userUsage.lastUsed = new Date();
        } else {
          coupon.usedBy.push({ user: userId, usedCount: 1, lastUsed: new Date() });
        }
        await coupon.save();
      }
    }

    // 7️⃣ Populate order for Shiprocket
    const populatedOrder = await Order.findById(order._id).populate("user", "name email phoneNumber");

    // 8️⃣ Create shipment on Shiprocket
    const shiprocketResult = await createShiprocketOrder(populatedOrder);

    // 9️⃣ Clear user cart & tempOrderData
    await User.findByIdAndUpdate(userId, { cart: [], tempOrderData: null });

    // 🔟 Send confirmation email
    try {
      await sendOrderConfirmationEmail(user, order);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.pricing.total,
        status: order.status,
        trackingNumber: order.trackingInfo?.trackingNumber,
        estimatedDelivery: order.trackingInfo?.estimatedDelivery,
        shiprocketIntegration: shiprocketResult.success ? "Success" : "Pending",
      },
    });

  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

// Enhanced COD order placement
const placeCodOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, shippingAddress, couponCode, selectedShippingRate } = req.body;
    const shiprocketCharges = selectedShippingRate.freight_charge

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phoneNumber ||
      !shippingAddress.pinCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    if (!selectedShippingRate) {
      return res.status(400).json({
        success: false,
        message: "Please select Shipping method",
      });
    }

    // Validate and calculate order total
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color || "Default",
        image: product.images[0],
      });
    }

    // Apply coupon logic
    let discount = 0;
    let couponDetails = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon && new Date() <= coupon.validUntil) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === "percentage") {
            discount = Math.min(
              (subtotal * coupon.discountValue) / 100,
              coupon.maxDiscountAmount || discount
            );
          } else {
            discount = coupon.discountValue;
          }
          couponDetails = {
            code: coupon.code,
            discountAmount: discount,
            discountType: coupon.discountType,
          };
        }
      }
    }

    // Calculate final amounts - Updated free shipping threshold to 399
    const shippingCharges = subtotal >= 399 ? 0 : 99;
    const tax = 0
    const total = Math.round(
      subtotal + shippingCharges - discount + shiprocketCharges
    );

    // Generate order number
    const orderNumber = `FH-${Date.now()}`;

    // Create order
    const orderData = {
      user: userId,
      orderNumber,
      courier_company_id: selectedShippingRate.courier_company_id,
      items: validatedItems,
      shippingAddress,
      pricing: { subtotal, shippingCharges, tax, discount, total },
      coupon: couponDetails,
      paymentInfo: {
        paymentStatus: "pending",
        razorpayOrderId: orderNumber,
        paymentMethod: "COD",
      },
      status: "confirmed",
      createdAt: new Date(),
    };

    const order = new Order(orderData);
    await order.save();

    // Update product stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Get user details for Shiprocket
    const user = await User.findById(userId);
    const populatedOrder = await Order.findById(order._id).populate(
      "user",
      "name email phoneNumber"
    );

    // Create shipment on Shiprocket
    const shiprocketResult = await createShiprocketOrder(populatedOrder);

    // Clear user's cart
    await User.findByIdAndUpdate(userId, {
      cart: [],
      tempOrderData: null,
    });

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(user, order);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "COD order placed successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.pricing.total,
        status: order.status,
        trackingNumber: order.trackingInfo?.trackingNumber,
        estimatedDelivery: order.trackingInfo?.estimatedDelivery,
        shiprocketIntegration: shiprocketResult.success ? "Success" : "Pending",
      },
    });
  } catch (error) {
    console.error("Create COD order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create COD order",
    });
  }
};

// Get shipping rates for checkout - IMPROVED ERROR HANDLING
const getShippingRates = async (req, res) => {
  try {
    console.log("📝 Get shipping rates called");
    console.log("Request body:", req.body);

    const { deliveryPincode, weight = 0.5, cod = 0 } = req.body;

    if (!deliveryPincode) {
      return res.status(400).json({
        success: false,
        message: "Delivery pincode is required",
      });
    }

    // Validate pincode format
    if (!/^[1-9][0-9]{5}$/.test(deliveryPincode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit pincode",
      });
    }

    // If Shiprocket service is available and properly configured, use it
    if (
      shiprocketService &&
      process.env.SHIPROCKET_EMAIL &&
      process.env.SHIPROCKET_PASSWORD
    ) {
      try {
        const pickupPincode = process.env.PICKUP_PINCODE || "110001";
        console.log("🚚 Attempting to get Shiprocket rates...");

        const rates = await shiprocketService.getShippingRates(
          pickupPincode,
          deliveryPincode,
          weight,
          cod
        );

        if (rates && rates.data && rates.data.available_courier_companies) {
          console.log("✅ Shiprocket rates fetched successfully");
          return res.status(200).json({
            success: true,
            rates: rates.data.available_courier_companies,
            source: "shiprocket",
          });
        }
      } catch (shiprocketError) {
        console.error("❌ Shiprocket error:", shiprocketError.message);
        // Continue to fallback rates instead of failing
      }
    } else {
      console.log("⚠️ Shiprocket service not configured, using fallback rates");
    }

    // Enhanced mock shipping rates based on pincode zones
    const firstDigit = parseInt(deliveryPincode.charAt(0));
    let baseRate = 50;
    let expressRate = 80;

    // Zone-based pricing (simplified)
    if (firstDigit >= 1 && firstDigit <= 3) {
      // North India - closer zones
      baseRate = 40;
      expressRate = 70;
    } else if (firstDigit >= 4 && firstDigit <= 6) {
      // West/Central India
      baseRate = 50;
      expressRate = 80;
    } else if (firstDigit >= 7 && firstDigit <= 8) {
      // East/Northeast India - farther zones
      baseRate = 60;
      expressRate = 90;
    } else if (firstDigit === 9) {
      // South India
      baseRate = 55;
      expressRate = 85;
    }

    const mockRates = [
      {
        courier_company_id: 1,
        courier_name: "Standard Delivery",
        freight_charge: baseRate,
        cod_charge: cod > 0 ? 25 : 0,
        other_charges: 0,
        total_charge: baseRate + (cod > 0 ? 25 : 0),
        etd: "4-6 days",
        min_weight: 0.5,
        rate_type: "surface",
      },
      {
        courier_company_id: 2,
        courier_name: "Express Delivery",
        freight_charge: expressRate,
        cod_charge: cod > 0 ? 25 : 0,
        other_charges: 5,
        total_charge: expressRate + (cod > 0 ? 25 : 0) + 5,
        etd: "2-3 days",
        min_weight: 0.5,
        rate_type: "air",
      },
      {
        courier_company_id: 3,
        courier_name: "Same Day Delivery",
        freight_charge: 150,
        cod_charge: cod > 0 ? 25 : 0,
        other_charges: 10,
        total_charge: 150 + (cod > 0 ? 25 : 0) + 10,
        etd: "Same day",
        min_weight: 0.5,
        rate_type: "premium",
        available: firstDigit >= 1 && firstDigit <= 4, // Only for major cities
      },
    ].filter((rate) => rate.available !== false); // Remove unavailable options

    res.status(200).json({
      success: true,
      rates: mockRates,
      source: "fallback",
      message: "Shipping rates calculated (Shiprocket service unavailable)",
    });
  } catch (error) {
    console.error("❌ Get shipping rates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get shipping rates",
      error: error.message,
    });
  }
};

// Enhanced order tracking
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "items.product",
      "name images"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let trackingData = null;
    let shiprocketTracking = null;

    if (order.trackingInfo?.trackingNumber && shiprocketService) {
      try {
        shiprocketTracking = await shiprocketService.trackShipment(
          order.trackingInfo.trackingNumber
        );

        // Update order status based on tracking data
        if (shiprocketTracking.tracking_data?.track_status) {
          const trackStatus = shiprocketTracking.tracking_data.track_status;
          let newStatus = order.status;

          switch (trackStatus.toLowerCase()) {
            case "shipped":
            case "in transit":
              newStatus = "shipped";
              break;
            case "out for delivery":
              newStatus = "out_for_delivery";
              break;
            case "delivered":
              newStatus = "delivered";
              if (!order.deliveredAt) {
                order.deliveredAt = new Date();
              }
              break;
          }

          if (newStatus !== order.status) {
            order.status = newStatus;
            order.trackingInfo.currentStatus = trackStatus;
            order.trackingInfo.lastUpdate = new Date();
            await order.save();
          }
        }

        trackingData = shiprocketTracking.tracking_data;
      } catch (trackingError) {
        console.error("Tracking error:", trackingError);
      }
    }

    res.status(200).json({
      success: true,
      order,
      trackingData,
      shiprocketTracking,
    });
  } catch (error) {
    console.error("Track order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track order",
    });
  }
};

// Enhanced order cancellation
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!["confirmed", "processing"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Cancel shipment on Shiprocket if exists
    if (order.trackingInfo?.trackingNumber && shiprocketService) {
      try {
        await shiprocketService.cancelShipment(
          order.trackingInfo.trackingNumber
        );
        console.log("✅ Shiprocket shipment cancelled successfully");
      } catch (shiprocketError) {
        console.error("❌ Shiprocket cancellation error:", shiprocketError);
        // Continue with order cancellation even if Shiprocket fails
      }
    }

    // Update order status
    order.status = "cancelled";
    order.cancelReason = reason;
    order.cancelledAt = new Date();
    if (order.trackingInfo) {
      order.trackingInfo.currentStatus = "Cancelled";
      order.trackingInfo.lastUpdate = new Date();
    }

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ec4899;">Order Confirmation - FashionHub</h2>
        <p>Dear ${user.name || "Customer"},</p>
        <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Total Amount:</strong> ₹${order.pricing.total}</p>
          <p><strong>Payment Method:</strong> ${
            order.paymentInfo.paymentMethod
          }</p>
          ${
            order.trackingInfo?.trackingNumber
              ? `<p><strong>Tracking Number:</strong> ${order.trackingInfo.trackingNumber}</p>`
              : ""
          }
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.fullName}</p>
          <p>${order.shippingAddress.addressLine1}</p>
          ${
            order.shippingAddress.addressLine2
              ? `<p>${order.shippingAddress.addressLine2}</p>`
              : ""
          }
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${
      order.shippingAddress.pinCode
    }</p>
        </div>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for shopping with FashionHub!</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: emailHtml,
    });

    console.log(`✅ Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error);
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "items.product",
      "name images price"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  placeCodOrder,
  verifyPaymentAndCreateOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  trackOrder,
  getShippingRates,
};
