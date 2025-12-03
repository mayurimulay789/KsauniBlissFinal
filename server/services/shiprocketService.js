// const axios = require("axios");
// require("dotenv").config();

// class ShiprocketService {
//   constructor() {
//     this.baseURL =
//       process.env.SHIPROCKET_API_URL ||
//       "https://apiv2.shiprocket.in/v1/external";
//     this.token = null;
//     this.tokenExpiry = null;
//   }

//   // Authenticate with Shiprocket
//   async authenticate() {
//     try {
//       if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
//         return this.token;
//       }

//       const response = await axios.post(`${this.baseURL}/auth/login`, {
//         email: process.env.SHIPROCKET_EMAIL,
//         password: process.env.SHIPROCKET_PASSWORD,
//       });

//       this.token = response.data.token;
//       this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//       console.log("✅ Shiprocket authentication successful");
//       return this.token;
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket authentication error:",
//         error.response?.data || error.message
//       );
//       throw new Error("Failed to authenticate with Shiprocket");
//     }
//   }

//   // Get headers with authentication
//   async getHeaders() {
//     const token = await this.authenticate();
//     return {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };
//   }
//   // Create order on Shiprocket
//   async createOrder(orderData) {
//     try {
//       const headers = await this.getHeaders();

//       // Calculate total weight based on items
//       const totalWeight = orderData.items.reduce(
//         (weight, item) => weight + item.quantity * 0.5,
//         0.5
//       );

//       const shiprocketOrderData = {
//         order_id: orderData.orderNumber,
//         order_date: new Date(orderData.createdAt).toISOString().split("T")[0],
//         courier_company_id: orderData.courier_company_id || null,
//         pickup_location: "Primary",
//         billing_customer_name:
//           orderData.shippingAddress.fullName.split(" ")[0] ||
//           orderData.shippingAddress.fullName,
//         billing_last_name:
//           orderData.shippingAddress.fullName.split(" ").slice(1).join(" ") ||
//           "",
//         billing_address: orderData.shippingAddress.addressLine1,
//         billing_address_2: orderData.shippingAddress.addressLine2 || "",
//         billing_city: orderData.shippingAddress.city,
//         billing_pincode: orderData.shippingAddress.pinCode,
//         billing_state: orderData.shippingAddress.state,
//         billing_country: "India",
//         billing_email: orderData.user?.email || "customer@ksaunibliss.com",
//         billing_phone: orderData.shippingAddress.phoneNumber
//           .replace(/^\+91/, "")
//           .replace(/\D/g, ""),
//         shipping_is_billing: true,
//         order_items: orderData.items.map((item, index) => ({
//           name: item.name,
//           sku: item.product || `SKU-${index + 1}`,
//           units: item.quantity,
//           selling_price: item.price,
//           discount: "",
//           tax: "",
//           hsn: 441122,
//         })),
//         payment_method:
//           orderData.paymentInfo?.paymentMethod === "COD" ? "COD" : "Prepaid",
//         shipping_charges: orderData.pricing?.shippingCharges || orderData.shippingCharges || 0,
//         giftwrap_charges: 0,
//         transaction_charges: 0,
//         total_discount: orderData.pricing?.discount || orderData.discount || 0,
//         sub_total: orderData.pricing?.subtotal || orderData.subtotal || 0,
//         length: 15,
//         breadth: 10,
//         height: 5,
//         weight: totalWeight,
//       };

//       console.log(
//         "📦 Creating Shiprocket order:",
//         shiprocketOrderData.order_id
//       );

//       const response = await axios.post(
//         `${this.baseURL}/orders/create/adhoc`,
//         shiprocketOrderData,
//         { headers }
//       );

//       if (response.data.status_code === 1) {
//         console.log(
//           "✅ Shiprocket order created successfully:",
//           response.data.order_id
//         );
//         return response.data;
//       } else {
//         console.error("❌ Shiprocket order creation failed:", response.data);
//         throw new Error(response.data.message || "Failed to create order");
//       }
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket create order error:",
//         error.response?.data || error.message
//       );
//       throw new Error(
//         `Failed to create order on Shiprocket: ${
//           error.response?.data?.message || error.message
//         }`
//       );
//     }
//   }

//   // Assign AWB to shipment
//   async assignAwb(shipmentId, courierCompanyId) {
//     try {
//       const headers = await this.getHeaders();
    
//       const payload = {
//         shipment_id: shipmentId,
//         courier_id: courierCompanyId,
//         delivery_type: "Forward",
//         manifest: false
//       };
    
//       console.log("🚚 Assigning AWB for shipment:", shipmentId);
    
//       const response = await axios.post(
//         `${this.baseURL}/courier/assign/awb`,
//         payload,
//         { headers }
//       );
    
//       console.log("📦 Shiprocket AWB assignment response:", response.data);
    
//       if (response.data.awb_assign_status === 1 && response.data.response?.data?.awb_code) {
//         const { awb_code, courier_name, shipment_id, order_id } = response.data.response.data;
//         console.log(`✅ AWB assigned: ${awb_code} via ${courier_name}`);
//         return response.data.response.data; // return actual shipment info
//       } else {
//         console.error("❌ AWB assignment failed:", response.data);
//         throw new Error(response.data.message || "Failed to assign AWB");
//       }
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket AWB assignment error:",
//         error.response?.data || error.message
//       );
//       throw new Error(
//         `Failed to assign AWB: ${
//           error.response?.data?.message || error.message
//         }`
//       );
//     }
//   }



//   // Create shipment after order creation
//   async createShipment(orderId, courierCompanyId, totalWeight) {
//     try {
//       const headers = await this.getHeaders();

//       const shipmentData = {
//         order_id: orderId,
//         courier_id: courierCompanyId,
//         length: 15,
//         breadth: 10,
//         height: 5,
//         weight: totalWeight
//       };

//       console.log("🚚 Creating Shiprocket shipment for order:", orderId);

//       const response = await axios.post(
//         `${this.baseURL}/shipments/create/adhoc`,
//         shipmentData,
//         { headers }
//       );

//       console.log("📦 Shiprocket shipment creation response:", response.data);

//       if (response.data.status_code === 1) {
//         console.log(
//           "✅ Shiprocket shipment created successfully:",
//           response.data.shipment_id
//         );
//         return response.data;
//       } else {
//         console.error("❌ Shiprocket shipment creation failed:", response.data);
//         throw new Error(response.data.message || "Failed to create shipment");
//       }
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket create shipment error:",
//         error.response?.data || error.message
//       );
//       throw new Error(
//         `Failed to create shipment: ${
//           error.response?.data?.message || error.message
//         }`
//       );
//     }
//   }

//   // Get shipping rates
//   async getShippingRates(pickupPincode, deliveryPincode, weight, cod = 0) {
//     try {
//       const headers = await this.getHeaders();

//       const response = await axios.get(
//         `${this.baseURL}/courier/serviceability/`,
//         {
//           headers,
//           params: {
//             pickup_postcode: pickupPincode,
//             delivery_postcode: deliveryPincode,
//             weight: weight,
//             cod: cod,
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket get rates error:",
//         error.response?.data || error.message
//       );
//       throw new Error("Failed to get shipping rates");
//     }
//   }

//   // Track shipment
//   async trackShipment(awbCode) {
//     try {
//       const headers = await this.getHeaders();

//       const response = await axios.get(
//         `${this.baseURL}/courier/track/awb/${awbCode}`,
//         { headers }
//       );

//       if (response.data.status_code === 200) {
//         return response.data;
//       } else {
//         throw new Error(
//           response.data.message || "Tracking information not available"
//         );
//       }
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket tracking error:",
//         error.response?.data || error.message
//       );
//       throw new Error(
//         `Failed to track shipment: ${
//           error.response?.data?.message || error.message
//         }`
//       );
//     }
//   }

//   // Cancel shipment
//   async cancelShipment(awbCodes) {
//     try {
//       const headers = await this.getHeaders();

//       const awbArray = Array.isArray(awbCodes) ? awbCodes : [awbCodes];

//       const response = await axios.post(
//         `${this.baseURL}/orders/cancel`,
//         { awbs: awbArray },
//         { headers }
//       );

//       console.log("🚫 Shiprocket shipment cancelled:", awbArray);
//       return response.data;
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket cancel shipment error:",
//         error.response?.data || error.message
//       );
//       throw new Error("Failed to cancel shipment");
//     }
//   }

//   // Get all orders from Shiprocket
//   async getOrders(page = 1, perPage = 10) {
//     try {
//       const headers = await this.getHeaders();

//       const response = await axios.get(`${this.baseURL}/orders`, {
//         headers,
//         params: { page, per_page: perPage },
//       });

//       return response.data;
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket get orders error:",
//         error.response?.data || error.message
//       );
//       throw new Error("Failed to get orders");
//     }
//   }

//   // Generate AWB (Air Waybill)
//   async generateAWB(shipmentId) {
//     try {
//       const headers = await this.getHeaders();

//       const response = await axios.post(
//         `${this.baseURL}/courier/assign/awb`,
//         { shipment_id: shipmentId },
//         { headers }
//       );

//       return response.data;
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket AWB generation error:",
//         error.response?.data || error.message
//       );
//       throw new Error("Failed to generate AWB");
//     }
//   }

//   // Schedule pickup
//   async schedulePickup(shipmentId, pickupDate) {
//     try {
//       const headers = await this.getHeaders();

//       const response = await axios.post(
//         `${this.baseURL}/courier/generate/pickup`,
//         {
//           shipment_id: [shipmentId],
//           pickup_date: pickupDate,
//         },
//         { headers }
//       );

//       return response.data;
//     } catch (error) {
//       console.error(
//         "❌ Shiprocket pickup scheduling error:",
//         error.response?.data || error.message
//       );
//       throw new Error("Failed to schedule pickup");
//     }
//   }
// }

// module.exports = new ShiprocketService();


const axios = require("axios");
require("dotenv").config();

class ShiprocketService {
  constructor() {
    this.baseURL =
      process.env.SHIPROCKET_API_URL ||
      "https://apiv2.shiprocket.in/v1/external";
    this.token = null;
    this.tokenExpiry = null;
  }

  // 🔐 Authenticate
  async authenticate() {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      });

      this.token = response.data.token;
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // valid for 24 hrs
      return this.token;
    } catch (error) {
      console.error("❌ Auth error:", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Shiprocket");
    }
  }

  // 📦 Create Order
  async createOrder(orderData) {
    try {
      const headers = await this.getHeaders();

      const totalWeight = orderData.items.reduce(
        (weight, item) => weight + item.quantity * 0.5,
        0.5
      );

      const payload = {
        order_id: orderData.orderNumber,
        order_date: new Date(orderData.createdAt).toISOString().split("T")[0],
        pickup_location: "Primary",
        billing_customer_name:
          orderData.shippingAddress.fullName.split(" ")[0],
        billing_last_name:
          orderData.shippingAddress.fullName.split(" ").slice(1).join(" ") ||
          "",
        billing_address: orderData.shippingAddress.addressLine1,
        billing_address_2: orderData.shippingAddress.addressLine2 || "",
        billing_city: orderData.shippingAddress.city,
        billing_pincode: orderData.shippingAddress.pinCode,
        billing_state: orderData.shippingAddress.state,
        billing_country: "India",
        billing_email: orderData.user?.email || "ksaunibliss@gmail.com",
        billing_phone: orderData.shippingAddress.phoneNumber
          .replace(/^\+91/, "")
          .replace(/\D/g, ""),
        shipping_is_billing: true,
        order_items: orderData.items.map((item, i) => ({
          name: item.name,
          sku: item.product || `SKU-${i + 1}`,
          units: item.quantity,
          selling_price: item.price,
          hsn: 441122,
        })),
        payment_method:
          orderData.paymentInfo?.method === "COD" ? "COD" : "Prepaid",
        shipping_charges:
          orderData.pricing?.shippingCharges ||
          orderData.shippingCharges ||
          0,
        total_discount:
          orderData.pricing?.discount || orderData.discount || 0,
        sub_total: orderData.pricing?.subtotal || orderData.subtotal || 0,
        length: 15,
        breadth: 10,
        height: 5,
        weight: totalWeight,
      };

      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        payload,
        { headers }
      );

      if (response.data.status_code === 1) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to create order");
    } catch (error) {
      console.error("❌ Create order error:", error.response?.data || error.message);
      throw new Error("Failed to create order");
    }
  }

  // 🚚 Get Available Couriers
  async getAvailableCouriers(pickupPincode, deliveryPincode, weight, cod = 0) {
    try {
       if (!await isPickupPincodeValid(pickupPincode)) {
            throw new Error(`Pickup pincode ${pickupPincode} is not in your account pickup addresses`);
        }
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/courier/serviceability/`,
        {
          headers,
          params: {
            pickup_postcode: pickupPincode,
            delivery_postcode: deliveryPincode,
            weight,
            cod,
          },
        }
      );
      return response.data.data.available_courier_companies;
    } catch (error) {
      console.error("❌ Get couriers error:", error.response?.data || error.message);
      throw new Error("Failed to get courier serviceability");
    }
  }

  async  isPickupPincodeValid(pincode) {
    const addresses = await getPickupAddresses();
    return addresses.some(addr => addr.pin_code === pincode);
  }

  async getPickupAddresses() {
    const { data } = await axios.get(`${SHIPROCKET_API_BASE}/settings/company/pickup`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data.data; // Array of pickup addresses
  }



  

  // 🏷️ Assign AWB
  async assignAwb(shipmentId, courierCompanyId) {
    try {
      const headers = await this.getHeaders();
      const payload = { shipment_id: shipmentId, courier_id: courierCompanyId };

      const response = await axios.post(
        `${this.baseURL}/courier/assign/awb`,
        payload,
        { headers }
      );

      if (response.data.awb_assign_status === 1) {
        const data = response.data.response.data;
        return data;
      }
      throw new Error(response.data.message || "Failed to assign AWB");
    } catch (error) {
      console.error("❌ Assign AWB error:", error.response?.data || error.message);
      throw new Error("Failed to assign AWB");
    }
  }

  // 🔍 Check AWB Status
  async checkAwbStatus(orderId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/orders/show/${orderId}`,
        { headers }
      );

      const order = response.data.data;
      if (order.awb_code) {
        return { assigned: true, awb_code: order.awb_code, courier_id: order.courier_company_id };
      }
      return { assigned: false };
    } catch (error) {
      console.error("❌ Check AWB error:", error.response?.data || error.message);
      throw new Error("Failed to check AWB status");
    }
  }

  // 🚦 Track Shipment
  async trackShipment(awbCode) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/courier/track/awb/${awbCode}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Track error:", error.response?.data || error.message);
      throw new Error("Failed to track shipment");
    }
  }

async trackShiprocketShipment(shipmentId) {
  try {
    const headers = await this.getHeaders();
    const url = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`;

    const response = await axios.get(url,  { headers });

    return response.data; // contains tracking info
  } catch (error) {
    console.error("❌ Error tracking Shiprocket shipment:", error.response?.data || error.message);
    throw new Error("Failed to track shipment");
  }
}

  // 🚫 Cancel Shipment
  async cancelShipment2(awbCodes) {
    try {
      const headers = await this.getHeaders();
      const awbArray = Array.isArray(awbCodes) ? awbCodes : [awbCodes];

      const response = await axios.post(
        `${this.baseURL}/orders/cancel`,
        { awbs: awbArray },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Cancel error:", error.response?.data || error.message);
      throw new Error("Failed to cancel shipment");
    }
  }


  
  async  handleShiprocketOrderCancel(order) {
    const headers = await this.getHeaders();
    if (!order.shiprocketOrderId) {
      return;
    }

    const orderId = order.shiprocketOrderId;

    try {
      // 1️⃣ Fetch order details
      const orderResponse = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`,
        {
          headers
        }
      );

      const data = orderResponse.data?.data;
      if (!data) {
        return;
      }

      const shipment = data.shipments;

      // 2️⃣ Determine which cancel endpoint to call
      if (shipment.awb) {
        // If AWB exists → cancel by AWB
        const cancelAwbResponse = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs",
          {
            awbs: [shipment.awb],
          },
          {
            headers
          }
        );
      } else {
        // If AWB is null → cancel by order ID
        const cancelOrderResponse = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/orders/cancel",
          {
            ids: [orderId],
          },
          {
            headers
          }
        );
      }
    } catch (error) {
      console.error("Error handling Shiprocket order:", error.response?.data || error.message);
    }
  }

  async  cancelShipment(shipmentId) {
  try {
    const headers = await this.getHeaders();
    const response = await axios.delete(
      `https://apiv2.shiprocket.in/v1/external/courier/cancel/shipment/${shipmentId}`,
      {
        headers
       
      }
    );

    if (response.data.status_code === 1) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to cancel shipment");
    }
  } catch (error) {
    console.error("❌ Cancel shipment error:", error.response?.data || error.message);
    throw new Error("Failed to cancel shipment");
  }
}

  // 📅 Schedule Pickup
  async schedulePickup(shipmentId, pickupDate) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/courier/generate/pickup`,
        { shipment_id: [shipmentId], pickup_date: pickupDate },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Pickup error:", error.response?.data || error.message);
      throw new Error("Failed to schedule pickup");
    }
  }

  // 🔧 Helper: Get headers
  async getHeaders() {
    const token = await this.authenticate();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
}

module.exports = new ShiprocketService();
