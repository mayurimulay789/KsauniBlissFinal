const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const shiprocketService = require("../services/shiprocketService");

// Unified order shaper for client responses
const shapeOrder = (o) => {
  if (!o) return o;
  const statusRaw = (o.status || "").toString();
  // normalize status to lowercase for client
  const status = statusRaw ? statusRaw.toLowerCase() : "pending";
  const subtotal = o.subtotal ?? (o.pricing && o.pricing.subtotal) ?? 0;
  const shippingCharge = o.shippingCharge ?? (o.pricing && (o.pricing.shippingCharges ?? o.pricing.shippingCharge)) ?? 0;
  const discount = o.discount ?? (o.pricing && o.pricing.discount) ?? 0;
  const total = o.total ?? (o.pricing && o.pricing.total) ?? subtotal + shippingCharge - discount;

  return {
    ...o.toObject?.() ?? o,
    status,
    pricing: {
      subtotal,
      shipping: shippingCharge,
      discount,
      total,
    },
  };
};


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

// Enhanced Shiprocket integration function (kept your original style)
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
      return { success: false, error: "Shiprocket service not configured" };
    }

    // Create order on Shiprocket
    const shiprocketOrderResponse = await shiprocketService.createOrder(order);

   

    



    // if (shiprocketOrderResponse.status_code === 1) {
    //   const shipmentId = shiprocketOrderResponse.shipment_id;

    //   let cod_order = order?.paymentInfo?.method == "COD" ? 0 : 1

    //   console.log("cod_order",cod_order)

    //   // const couriers = await shiprocketService.getAvailableCouriers("400066",order?.shippingAddress?.pinCode,"1",cod_order)


      

    //   const couriers = await shiprocketService.getAvailableCouriers("110059","400001","1",cod_order)

    //   console.log("couriers",couriers)

    //   if (couriers.length > 0) {
    //   const courierId = couriers[0].courier_company_id;
  
    //   console.log("courierId",courierId)
    //   // Assign AWB to shipment
    //   const AWBResponse = await shiprocketService.assignAwb(
    //     shipmentId,
    //     courierId
    //   );

    //   if (AWBResponse.status_code === 200) {
    //     // Update order with Shiprocket details
    //     order.trackingInfo = {
    //       trackingNumber: AWBResponse.awb_code,
    //       carrier: AWBResponse.courier_name || "Shiprocket",
    //       shiprocketOrderId: shiprocketOrderResponse.order_id,
    //       shipmentId: AWBResponse.shipment_id,
    //       trackingUrl: `https://shiprocket.co/tracking/${AWBResponse.awb_code}`,
    //       estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //       currentStatus: "Order Confirmed",
    //       lastUpdate: new Date(),
    //     };
    //     console.log("order.trackingInfo",order.trackingInfo)
    //     await order.save();
    //     console.log("✅ Shiprocket integration completed successfully");
    //     return {
    //       success: true,
    //       trackingNumber: AWBResponse.awb_code,
    //       shiprocketOrderId: shiprocketOrderResponse.order_id,
    //     };
    //   }
    //   console.log("✅ AWB Assigned:", awb);
    // }
    // }

    if (shiprocketOrderResponse.status_code === 1) {
      const shipmentId = shiprocketOrderResponse.shipment_id;

      // ✅ Just save shipmentId to the order
      order.shiprocketShipmentId = shipmentId;
      order.shiprocketOrderId = shiprocketOrderResponse.order_id

      // order["shiprocketShipmentId"] = 935898884;
      await order.save();

      console.log("✅ Shiprocket shipment ID saved:", shipmentId,order);

      return {
        success: true,
        shiprocketOrderId: shiprocketOrderResponse.order_id,
        shipmentId: shipmentId,
        order:order
      };
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
    return { success: false, error: error.message };
  }
};




// Create Razorpay order (unchanged)
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

    // if (!selectedShippingRate) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please select Shipping method",
    //   });
    // }

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
        itemTotal, 
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

    // const shiprocketCharges = selectedShippingRate.freight_charge;
    // Calculate final amounts (kept exactly as you had)
    const shippingCharges = subtotal >= 399 ? 0 : 99;
    const tax = 0;
    // const total = Math.round(
    //   subtotal + shippingCharges - discount + shiprocketCharges
    // );

    const total = Math.round(
      subtotal + shippingCharges - discount 
    );

    //todo:need to ask
    // const total = 1;

    // Generate order number
    const orderNumber = `FH-${Date.now()}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { userId: userId, couponCode: couponCode || "" },
    });

    // console.log("razorpayOrder",razorpayOrder)
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
        method: "RAZORPAY",
        status: "pending",
      },
      status: "CONFIRMED",
      createdAt: new Date(),
      total:total,
      subtotal:subtotal,
      discount,
    };

    // const order = new Order({tempOrderData})
     const order = new Order({
      user: userId,
      orderNumber,
      // courier_company_id: selectedShippingRate.courier_company_id,
      items: validatedItems,
      shippingAddress,

      // root money fields (cover schemas that require these at root)
      subtotal,
      //shippingCharge: shippingCharges + shiprocketCharges,
      shippingCharge: shippingCharges ,

      discount,
      total,

      // keep your existing pricing object too (covers your "old style")
      pricing: { subtotal, shippingCharges, tax, discount, total },

      coupon: couponDetails,

      paymentInfo: {
        razorpayOrderId: razorpayOrder.id,
        method: "RAZORPAY",
        status: "PENDING",
      },

      // use a safe enum value (uppercase) to avoid `confirmed` enum errors
      status: "ABANDONED",

      trackingInfo: { awbStatus: "PENDING" },
      createdAt: new Date(),
    });

    await order.save();

    // console.log("order",order)

    tempOrderData["temp_order_id"] = order._id

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
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// Enhanced payment verification — now responds first, Shiprocket/email later
const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const userId = req.user.userId;

    // 1) Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // 2) Fetch temp order data
    const user = await User.findById(userId).lean();
    if (!user?.tempOrderData) {
      return res
        .status(400)
        .json({ success: false, message: "Order data not found" });
    }

    // Clean temp data
    const { _id, __v, ...orderDataWithoutId } = user.tempOrderData;
    orderDataWithoutId.items = orderDataWithoutId.items.map(
      ({ _id, __v, ...rest }) => rest
    );

    // 3) Update payment info
    orderDataWithoutId.paymentInfo = {
      ...orderDataWithoutId.paymentInfo,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "PAID",
      paidAt: new Date(),
    };
    orderDataWithoutId.status = "CONFIRMED";

    // 4) Create order
    // const order = await Order.create(orderDataWithoutId);


    // let _id = tempOrderData[""]

    // console.log("user.tempOrderData",user.tempOrderData)

    let temp_order_id =  user.tempOrderData?.["temp_order_id"]

    // console.log("temp_order_id",temp_order_id)

    const order = await Order.findOne({ _id:  temp_order_id, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = "CONFIRMED";
    order.paymentInfo = {
      ...orderDataWithoutId.paymentInfo,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "PAID",
      paidAt: new Date(),
      method: "RAZORPAY"
    };

    await order.save();
    // console.log("✅ Order updated:", update_order._id);

    // 5) Update stock
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    // 6) Update coupon usage
    // if (order.coupon?.code) {
    //   const coupon = await Coupon.findOne({ code: order.coupon.code });
    //   if (coupon) {
    //     coupon.usedCount += 1;
    //     const userUsage = coupon.usedBy.find(
    //       (u) => u.user.toString() === userId
    //     );
    //     if (userUsage) {
    //       userUsage.usedCount += 1;
    //       userUsage.lastUsed = new Date();
    //     } else {
    //       coupon.usedBy.push({
    //         user: userId,
    //         usedCount: 1,
    //         lastUsed: new Date(),
    //       });
    //     }
    //     await coupon.save();
    //   }
    // }

    // 7) Respond immediately — don't wait for Shiprocket/email
    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        trackingNumber: order.trackingInfo?.trackingNumber,
        estimatedDelivery: order.trackingInfo?.estimatedDelivery,
        shiprocketIntegration: "Pending",
        pricing: { subtotal: order.subtotal, shipping: order.shippingCharge, discount: order.discount, total: order.total },
      },
    });

    // 8) Background: Shiprocket + clear cart + email
    setImmediate(async () => {
      try {
        const populatedOrder = await Order.findById(order._id).populate(
          "user",
          "name email phoneNumber"
        );
        const shiprocketResult = await createShiprocketOrder(populatedOrder);
        await User.findByIdAndUpdate(userId, { cart: [], tempOrderData: null });
        try {
          await sendOrderConfirmationEmail(populatedOrder.user, populatedOrder);
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
        console.log(
          "Shiprocket status:",
          shiprocketResult.success ? "Success" : "Pending"
        );
      } catch (bgErr) {
        console.error("Background SR/email error:", bgErr);
      }
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};

// COD order — respond first, run Shiprocket/email in background
const placeCodOrder = async (req, res) => {
  try {
    
    const userId = req.user.userId;
    const { items, shippingAddress, couponCode, selectedShippingRate } =
      req.body;

    // console.log("placing cod order",req.body)
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart items are required" });
    }
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phoneNumber ||
      !shippingAddress.pinCode
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Complete shipping address is required",
        });
    }
    //
    // if (!selectedShippingRate) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Please select Shipping method" });
    // }

    // const shiprocketCharges = selectedShippingRate.freight_charge || 0;

    // Validate and calculate using DB prices
    let subtotal = 0;
    const validatedItems = [];
    for (const it of items) {
      const product = await Product.findById(it.productId).select(
        "name price images stock"
      );
      if (!product) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Product not found: ${it.productId}`,
          });
      }
      if (product.stock < it.quantity) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
      }
      const quantity = Number(it.quantity || 1);
      const price = Number(product.price || 0);
      const itemTotal = price * quantity; // REQUIRED by schema
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
        size: it.size || "",
        color: it.color || "Default",
        image: product.images?.[0],
        itemTotal, // <-- REQUIRED
      });
    }

    // (Optional) coupon
    let discount = 0;
    let couponDetails = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (
        coupon &&
        new Date() <= coupon.validUntil &&
        subtotal >= (coupon.minOrderValue || 0)
      ) {
        discount =
          coupon.discountType === "percentage"
            ? Math.min(
                (subtotal * coupon.discountValue) / 100,
                coupon.maxDiscountAmount || Infinity
              )
            : coupon.discountValue || 0;
        couponDetails = {
          code: coupon.code,
          discountAmount: discount,
          discountType: coupon.discountType,
        };
      }
    }

    // Shipping & totals
    const shippingCharges = subtotal >= 399 ? 0 : 99;
    const tax = 0;
    // const total = Math.round(
    //   subtotal + shippingCharges - discount + shiprocketCharges
    // );

    const total = Math.round(
      subtotal + shippingCharges - discount 
    );


    // Build order doc with BOTH root amounts and pricing block
    const orderNumber = `FH-${Date.now()}`;
    const order = new Order({
      user: userId,
      orderNumber,
      // courier_company_id: selectedShippingRate.courier_company_id,
      items: validatedItems,
      shippingAddress,

      // root money fields (cover schemas that require these at root)
      subtotal,
      //shippingCharge: shippingCharges + shiprocketCharges,
      shippingCharge: shippingCharges ,

      discount,
      total,

      // keep your existing pricing object too (covers your "old style")
      pricing: { subtotal, shippingCharges, tax, discount, total },

      coupon: couponDetails,

      paymentInfo: {
        method: "COD", // keep your existing field
        status: "PENDING",
        razorpayOrderId: orderNumber, // you were storing this
        method: "COD", // add this so method is present if your schema requires it
      },

      // use a safe enum value (uppercase) to avoid `confirmed` enum errors
      status: "CONFIRMED",

      trackingInfo: { awbStatus: "PENDING" },
      createdAt: new Date(),
    });

    await order.save();

    // decrement stock
    await Promise.all(
      validatedItems.map((it) =>
        Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.quantity } })
      )
    );

    // Respond NOW (prevents blank page)
    res.status(200).json({
      success: true,
      message: "COD order placed successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        trackingNumber: order.trackingInfo?.trackingNumber,
        estimatedDelivery: order.trackingInfo?.estimatedDelivery,
        shiprocketIntegration: "Pending",
        pricing: { subtotal: order.subtotal, shipping: order.shippingCharge, discount: order.discount, total: order.total },
      },
    });

    // Background: Shiprocket + clear cart + email
    setImmediate(async () => {
      try {
        const populatedOrder = await Order.findById(order._id).populate(
          "user",
          "name email phoneNumber"
        );
        const sr = await createShiprocketOrder(populatedOrder).catch((e) => {
          console.error("Shiprocket (background) error:", e?.message || e);
          return { success: false, error: e?.message || "Shiprocket failed" };
        });

        if (sr.success) {
          // sr.order contains the updated order with shipmentId, etc.
          const tempOrderData = sr.order;

          // Update user's tempOrderData instead of clearing cart
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { tempOrderData },
            { new: true }
          );

          console.log("✅ User tempOrderData updated:", updatedUser.tempOrderData);
        } else {
          console.log("⚠️ Shiprocket order failed:", sr.error);
        }

        await User.findByIdAndUpdate(userId, { cart: [], tempOrderData: null });

        try {
          await sendOrderConfirmationEmail(populatedOrder.user, populatedOrder);
        } catch (emailErr) {
          console.error("Email sending failed:", emailErr?.message || emailErr);
        }

        console.log(
          "Shiprocket status:",
          sr?.success ? "Success" : "Pending/Failed"
        );
      } catch (bgErr) {
        console.error("Background flow error:", bgErr?.message || bgErr);
      }
    });
  } catch (error) {
    console.error("Create COD order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create COD order" });
  }
};

// Get shipping rates for checkout (unchanged)
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

    // Fallback mock rates (unchanged)
    const firstDigit = parseInt(deliveryPincode.charAt(0));
    let baseRate = 50;
    let expressRate = 80;
    if (firstDigit >= 1 && firstDigit <= 3) {
      baseRate = 40;
      expressRate = 70;
    } else if (firstDigit >= 4 && firstDigit <= 6) {
      baseRate = 50;
      expressRate = 80;
    } else if (firstDigit >= 7 && firstDigit <= 8) {
      baseRate = 60;
      expressRate = 90;
    } else if (firstDigit === 9) {
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
        available: firstDigit >= 1 && firstDigit <= 4,
      },
    ].filter((rate) => rate.available !== false);

    res.status(200).json({
      success: true,
      rates: mockRates,
      source: "fallback",
      message: "Shipping rates calculated (Shiprocket service unavailable)",
    });
  } catch (error) {
    console.error("❌ Get shipping rates error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to get shipping rates",
        error: error.message,
      });
  }
};

// Enhanced order tracking (unchanged)
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
              if (!order.deliveredAt) order.deliveredAt = new Date();
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

    res
      .status(200)
      .json({ success: true, order, trackingData, shiprocketTracking });
  } catch (error) {
    console.error("Track order error:", error);
    res.status(500).json({ success: false, message: "Failed to track order" });
  }
};

// Enhanced order cancellation (unchanged)
// Cancel order (user)
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    // 1) Fetch order owned by user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 2) Status guards (DB enum is UPPERCASE)
    const status = String(order.status || "").toUpperCase();
    const cancellable = ["PLACED", "CONFIRMED", "PROCESSING"]; // allow cancel before shipping
    const terminal = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];

    if (terminal.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled after shipping/delivery",
      });
    }
    if (!cancellable.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // 3) Try cancelling shipment in Shiprocket (if already created)
    // if (order.trackingInfo?.trackingNumber && shiprocketService?.cancelShipment) {
    //   try {
    //     await shiprocketService.cancelShipment(order.trackingInfo.trackingNumber);
    //     console.log("✅ Shiprocket shipment cancelled successfully");
    //   } catch (e) {
    //     console.error("❌ Shiprocket cancellation error:", e?.message || e);
    //     // continue; order cancellation should still proceed
    //   }
    // }

    //3) Try cancelling shipment in Shiprocket (if already created)

    if(order?.shiprocketOrderId){

      try {
        await shiprocketService.handleShiprocketOrderCancel(order);
        console.log("✅ Shiprocket shipment cancelled successfully");
      } catch (e) {
        console.error("❌ Shiprocket cancellation error:", e?.message || e);
        // continue; order cancellation should still proceed
      }

    }


    // 4) If prepaid (Razorpay) and paid, attempt refund (optional but recommended)
    try {
      const method = order.paymentInfo?.method;
      const pStatus = order.paymentInfo?.status;
      if (method === "RAZORPAY" && pStatus === "PAID" && razorpay?.payments?.refund) {
        const rupees =
          order.total ??
          order.pricing?.total ??
          ((order.subtotal || 0) + (order.shippingCharge || 0) - (order.discount || 0));
        const amountPaise = Math.max(0, Math.round((rupees || 0) * 100));

        const refund = await razorpay.payments.refund(order.paymentInfo.razorpayPaymentId, {
          amount: amountPaise,
          speed: "optimum",
          notes: { orderNumber: order.orderNumber || String(order._id) },
        });

        order.paymentInfo.status = "REFUNDED";
        order.paymentInfo.razorpayRefundId = refund?.id;
      }
    } catch (refundErr) {
      console.error("❌ Razorpay refund error:", refundErr?.message || refundErr);
      // mark for manual follow-up (do NOT break cancellation)
      order.paymentInfo = {
        ...(order.paymentInfo || {}),
        refundInitiated: true,
        refundError: (refundErr?.message || String(refundErr)).slice(0, 200),
      };
    }

    // 5) Apply cancellation
    order.status = "CANCELLED"; // enum uppercase
    order.cancelReason = reason || "Cancelled by user";
    order.cancelledAt = new Date();

    if (order.trackingInfo) {
      order.trackingInfo.currentStatus = "Cancelled";
      order.trackingInfo.lastUpdate = new Date();
    }

    await order.save();

    // 6) Restock items
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item?.product && item?.quantity) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
};


// Send order confirmation email (HARDENED)
const sendOrderConfirmationEmail = async (userArg, order) => {
  try {
    // Fallbacks in case caller passed null/lean docs
    const user = userArg || order?.user || {};
    const toEmail = user?.email || process.env.FALLBACK_TEST_EMAIL; // Optional fallback

    // Resolve totals robustly (supports both "pricing.total" and root "total")
    const totalNum = Number(
      (order && order.pricing && order.pricing.total != null
        ? order.pricing.total
        : order && order.total != null
        ? order.total
        : 0)
    );
    const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

    // Resolve payment method (old/new field names)
    const method =
      (order && order.paymentInfo && (order.paymentInfo.method || order.paymentInfo.method)) || "—";

    // Resolve tracking details regardless of field name
    const trackingNumber =
      (order && order.trackingInfo && (order.trackingInfo.trackingNumber || order.trackingInfo.awbCode)) || "";
    const estimatedDelivery =
      (order && order.trackingInfo && order.trackingInfo.estimatedDelivery) || null;

    // Defensive address reads
    const addr = order?.shippingAddress || {};
    const addressLine2 = addr.addressLine2 ? `<p>${addr.addressLine2}</p>` : "";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ec4899;">Order Confirmation - FashionHub</h2>
        <p>Dear ${user?.name || "Customer"},</p>
        <p>Thank you for your order! Your order has been confirmed and is being processed.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order?.orderNumber || "—"}</p>
          <p><strong>Total Amount:</strong> ${fmt(totalNum)}</p>
          <p><strong>Payment Method:</strong> ${method}</p>
          ${
            trackingNumber
              ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>`
              : ""
          }
          ${
            estimatedDelivery
              ? `<p><strong>Estimated Delivery:</strong> ${new Date(
                  estimatedDelivery
                ).toLocaleDateString()}</p>`
              : ""
          }
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${addr.fullName || ""}</p>
          <p>${addr.addressLine1 || ""}</p>
          ${addressLine2}
          <p>${addr.city || ""}, ${addr.state || ""} - ${addr.pinCode || ""}</p>
          ${addr.phoneNumber ? `<p>Phone: ${addr.phoneNumber}</p>` : ""}
        </div>

        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for shopping with FashionHub!</p>
      </div>
    `;

    if (!toEmail) {
      console.warn("⚠️ No recipient email found; skip sending.");
      return;
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: toEmail,
      subject: `Order Confirmation - ${order?.orderNumber || ""}`,
      html: emailHtml,
    });

    console.log(`✅ Order confirmation email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error);
  }
};

// Get user orders (unchanged)
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
      orders: orders.map(shapeOrder),
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
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// Get order details (unchanged)
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "items.product",
      "name images price"
    );

    console.log("getOrderDetails",order)

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order: shapeOrder(order) });
  } catch (error) {
    console.error("Get order details error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch order details" });
  }
};

// Moved getTrackingInfo into a utility function to be called on demand
// const fetchAndSetTrackingInfo = async (req, res) => {
//   try {
//     console.log("fetchAndSetTrackingInfo", req.body)
//     const userId = req.user.userId;
//     var order = req.body
//     console.log("order",order)
//     // var order = await shiprocketService.getOrderById(orderId); // Assume a service to get the single order
//     console.log("🚀 Fetching Shiprocket tracking for:", order.shiprocketShipmentId);


//     if (
//       !order.shiprocketShipmentId ||
//       !shiprocketService ||
//       !process.env.SHIPROCKET_EMAIL ||
//       !process.env.SHIPROCKET_PASSWORD
//     ) {
//       console.log("⚠️ Shiprocket service not configured or no shipment id yet");
//       // Optionally dispatch an action to update the store with a message
//       return;
//     }

//     const shiprocketTrackingResponse = await shiprocketService.trackShiprocketShipment(
//       order.shiprocketShipmentId
//     );

//     const trackUrl = shiprocketTrackingResponse?.tracking_data?.track_url || null;

//     if (trackUrl) {
//       // Dispatch an action to update the order in the Redux store
//       // dispatch({
//       //   type: "orders/updateOrderTracking",
//       //   payload: {
//       //     orderId,
//       //     trackingInfo: {
//       //       trackingUrl: trackUrl,
//       //       ...shiprocketTrackingResponse.tracking_data,
//       //     },
//       //   },
//       // });
//       var tempOrderData = req.body;


      
      
//       // Now you can safely assign the trackingUrl property
      
//       try {
//       const update_order = await Order.findOne({ shiprocketShipmentId: req.body.shiprocketShipmentId });
//       if (!update_order) {
//         return res.status(404).json({ success: false, message: "Order not found" });
//       }

//       update_order.trackingUrl = trackUrl; // set your tracking URL
//       console.log("update_order",update_order)
//       await update_order.save(); // now this works!
//     } catch (error) {
//       console.error("Order update failed, but continuing with user update:", error.message);
//       // The code will continue from here
//     }

//   // This part will now execute even if the above block fails
//   var tempOrderData = req.body;
//   tempOrderData["trackingUrl"]= trackUrl;

//   const updatedUser = await User.findByIdAndUpdate(
//     userId,
//     { tempOrderData },
//     { new: true }
//   );

//   console.log("✅ User tempOrderData updated:", updatedUser);

//       res.status(200).json({ success: true, order: shapeOrder(order),"trackingUrl":trackUrl });
//     }
//   } catch (error) {
//     console.error("❌ Shiprocket tracking failed:", error.message);
//     // Dispatch an error action or update state with an error message
//   }
// };

const fetchAndSetTrackingInfo = async (req, res) => {
  try {
    console.log("fetchAndSetTrackingInfo", req.body);

    const userId = req.user.userId;
    const { shiprocketShipmentId , _id} = req.body;

    console.log("req.body",req.body)

    if (!shiprocketShipmentId) {
      return res.status(400).json({ success: false, message: "Shipment ID is required" });
    }

    if (!shiprocketService || !process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      console.log("⚠️ Shiprocket service not configured");
      return res.status(500).json({ success: false, message: "Shiprocket not configured" });
    }

    // Fetch tracking info from Shiprocket
    const shiprocketTrackingResponse = await shiprocketService.trackShiprocketShipment(shiprocketShipmentId);
    console.log("shiprocketTrackingResponse",shiprocketTrackingResponse)

    const trackUrl = shiprocketTrackingResponse?.tracking_data?.track_url || null;

    const update_order = await Order.findOne({ _id:  _id, user: userId });
    if (!update_order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!trackUrl) {
      console.log("no track url")
      update_order.trackingInfo = {
      // ...update_order.trackingInfo,
      // ...shiprocketTrackingResponse.tracking_data,
      trackingUrl: trackUrl,
      message:"No tracking info yet"
      };
      
      await update_order.save();
      console.log("✅ Order updated:", update_order._id);

      // const updatedUser = await User.findByIdAndUpdate(
      //   userId,
      //   {
      //     "tempOrderData.trackingUrl": trackUrl,
      //     "tempOrderData.trackingInfo": {
      //       trackingUrl: trackUrl,
      //       message: "No tracking info yet"
      //     }
      //   },
      //   { new: true }
      // );

      
      return res.status(200).json({ success: false, message: "No tracking info yet" });
    }

    // Update the order document
    

    update_order.trackingUrl = trackUrl;
    update_order.trackingInfo = {
      // ...update_order.trackingInfo,
      // ...shiprocketTrackingResponse.tracking_data,
      trackingUrl: trackUrl

    };

    await update_order.save();
    console.log("✅ Order updated:", update_order._id);

    // Update user's tempOrderData
    // const updatedUser = await User.findByIdAndUpdate(
    //   userId,
    //   { "tempOrderData.trackingUrl": trackUrl },
    //   { new: true }
    // );
    // console.log("✅ User tempOrderData updated:", updatedUser.tempOrderData);

    res.status(200).json({ success: true, order: shapeOrder(update_order), trackingUrl: trackUrl });

  } catch (error) {
    console.error("❌ Shiprocket tracking failed:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch tracking info" });
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
  fetchAndSetTrackingInfo,
};
