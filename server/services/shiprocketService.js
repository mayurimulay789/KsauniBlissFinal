const axios = require("axios")
require("dotenv").config();

class ShiprocketService {
  constructor() {
    this.baseURL = process.env.SHIPROCKET_API_URL || "https://apiv2.shiprocket.in/v1/external"
    this.token = null
    this.tokenExpiry = null
  }

  // Authenticate with Shiprocket
  async authenticate() {
    try {
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token
      }

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      })

      this.token = response.data.token
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      console.log("✅ Shiprocket authentication successful")
      return this.token
    } catch (error) {
      console.error("❌ Shiprocket authentication error:", error.response?.data || error.message)
      throw new Error("Failed to authenticate with Shiprocket")
    }
  }

  // Get headers with authentication
  async getHeaders() {
    const token = await this.authenticate()
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  // Create order on Shiprocket
  async createOrder(orderData) {
    try {
      const headers = await this.getHeaders()

      // Calculate total weight based on items
      const totalWeight = orderData.items.reduce((weight, item) => weight + item.quantity * 0.5, 0.5)

      const shiprocketOrderData = {
        order_id: orderData.orderNumber,
        order_date: new Date(orderData.createdAt).toISOString().split("T")[0],
        pickup_location: "Primary",
        billing_customer_name: orderData.shippingAddress.fullName.split(" ")[0] || orderData.shippingAddress.fullName,
        billing_last_name: orderData.shippingAddress.fullName.split(" ").slice(1).join(" ") || "",
        billing_address: orderData.shippingAddress.addressLine1,
        billing_address_2: orderData.shippingAddress.addressLine2 || "",
        billing_city: orderData.shippingAddress.city,
        billing_pincode: orderData.shippingAddress.pinCode,
        billing_state: orderData.shippingAddress.state,
        billing_country: "India",
        billing_email: orderData.user?.email || "customer@fashionhub.com",
        billing_phone: orderData.shippingAddress.phoneNumber.replace(/^\+91/, "").replace(/\D/g, ""),
        shipping_is_billing: true,
        order_items: orderData.items.map((item, index) => ({
          name: item.name,
          sku: item.product || `SKU-${index + 1}`,
          units: item.quantity,
          selling_price: item.price,
          discount: "",
          tax: "",
          hsn: 441122,
        })),
        payment_method: orderData.paymentInfo?.paymentMethod === "COD" ? "COD" : "Prepaid",
        shipping_charges: orderData.pricing?.shippingCharges || 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: orderData.pricing?.discount || 0,
        sub_total: orderData.pricing?.subtotal,
        length: 15,
        breadth: 10,
        height: 5,
        weight: totalWeight,
      }

      console.log("📦 Creating Shiprocket order:", shiprocketOrderData.order_id)

      const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, shiprocketOrderData, { headers })

      if (response.data.status_code === 1) {
        console.log("✅ Shiprocket order created successfully:", response.data.order_id)
        return response.data
      } else {
        console.error("❌ Shiprocket order creation failed:", response.data)
        throw new Error(response.data.message || "Failed to create order")
      }
    } catch (error) {
      console.error("❌ Shiprocket create order error:", error.response?.data || error.message)
      throw new Error(`Failed to create order on Shiprocket: ${error.response?.data?.message || error.message}`)
    }
  }

  // Create shipment after order creation
  async createShipment(orderId, courierCompanyId = null) {
    try {
      const headers = await this.getHeaders()

      const shipmentData = {
        order_id: orderId,
        courier_company_id: courierCompanyId || 1,
        is_return: 0,
        is_insurance: 0,
      }

      console.log("🚚 Creating Shiprocket shipment for order:", orderId)

      const response = await axios.post(`${this.baseURL}/shipments/create/adhoc`, shipmentData, { headers })

      if (response.data.status_code === 1) {
        console.log("✅ Shiprocket shipment created successfully:", response.data.shipment_id)
        return response.data
      } else {
        console.error("❌ Shiprocket shipment creation failed:", response.data)
        throw new Error(response.data.message || "Failed to create shipment")
      }
    } catch (error) {
      console.error("❌ Shiprocket create shipment error:", error.response?.data || error.message)
      throw new Error(`Failed to create shipment: ${error.response?.data?.message || error.message}`)
    }
  }

  // Get shipping rates
  async getShippingRates(pickupPincode, deliveryPincode, weight, cod = 0) {
    try {
      const headers = await this.getHeaders()

      const response = await axios.get(`${this.baseURL}/courier/serviceability/`, {
        headers,
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          weight: weight,
          cod: cod,
        },
      })
      return response.data
    } catch (error) {
      console.error("❌ Shiprocket get rates error:", error.response?.data || error.message)
      throw new Error("Failed to get shipping rates")
    }
  }

  // Track shipment
  async trackShipment(awbCode) {
    try {
      const headers = await this.getHeaders()

      const response = await axios.get(`${this.baseURL}/courier/track/awb/${awbCode}`, { headers })

      if (response.data.status_code === 200) {
        return response.data
      } else {
        throw new Error(response.data.message || "Tracking information not available")
      }
    } catch (error) {
      console.error("❌ Shiprocket tracking error:", error.response?.data || error.message)
      throw new Error(`Failed to track shipment: ${error.response?.data?.message || error.message}`)
    }
  }

  // Cancel shipment
  async cancelShipment(awbCodes) {
    try {
      const headers = await this.getHeaders()

      const awbArray = Array.isArray(awbCodes) ? awbCodes : [awbCodes]

      const response = await axios.post(`${this.baseURL}/orders/cancel`, { awbs: awbArray }, { headers })

      console.log("🚫 Shiprocket shipment cancelled:", awbArray)
      return response.data
    } catch (error) {
      console.error("❌ Shiprocket cancel shipment error:", error.response?.data || error.message)
      throw new Error("Failed to cancel shipment")
    }
  }

  // Get all orders from Shiprocket
  async getOrders(page = 1, perPage = 10) {
    try {
      const headers = await this.getHeaders()

      const response = await axios.get(`${this.baseURL}/orders`, {
        headers,
        params: { page, per_page: perPage },
      })

      return response.data
    } catch (error) {
      console.error("❌ Shiprocket get orders error:", error.response?.data || error.message)
      throw new Error("Failed to get orders")
    }
  }

  // Generate AWB (Air Waybill)
  async generateAWB(shipmentId) {
    try {
      const headers = await this.getHeaders()

      const response = await axios.post(`${this.baseURL}/courier/assign/awb`, { shipment_id: shipmentId }, { headers })

      return response.data
    } catch (error) {
      console.error("❌ Shiprocket AWB generation error:", error.response?.data || error.message)
      throw new Error("Failed to generate AWB")
    }
  }

  // Schedule pickup
  async schedulePickup(shipmentId, pickupDate) {
    try {
      const headers = await this.getHeaders()

      const response = await axios.post(
        `${this.baseURL}/courier/generate/pickup`,
        {
          shipment_id: [shipmentId],
          pickup_date: pickupDate,
        },
        { headers },
      )

      return response.data
    } catch (error) {
      console.error("❌ Shiprocket pickup scheduling error:", error.response?.data || error.message)
      throw new Error("Failed to schedule pickup")
    }
  }
}

module.exports = new ShiprocketService()
