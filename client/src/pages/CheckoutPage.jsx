"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingBag, MapPin, CreditCard, Tag, Truck, Shield, X } from "lucide-react"
import {
  createRazorpayOrder,
  clearError,
  clearSuccess,
  placeCodOrder,
  verifyPayment,
  selectRazorpayOrder,
  selectOrderSummary,
  selectOrderLoading,
  selectOrderError,
  selectOrderSuccess,
  selectShippingRates,
  selectCartItems,
  selectCartSummary,
  selectAppliedCoupon,
  selectCouponLoading,
  selectCouponError,
  selectUser,
} from "../store/slices/orderSlice"
import {
  validateCoupon,
  removeCoupon,
  clearError as clearCouponError,
  fetchAvailableCoupons,
} from "../store/slices/couponSlice"
import { fetchCart } from "../store/slices/cartSlice"
import LoadingSpinner from "../components/LoadingSpinner"
import { PaymentModal } from "./PaymentModal"

const CheckoutPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const rzpInstanceRef = useRef(null)
  
  // Check if this is a Buy Now flow
  const isBuyNow = location.state?.buyNow || false
  const buyNowProduct = location.state?.buyNowProduct || null
  
  // Use memoized selectors
  const razorpayOrder = useSelector(selectRazorpayOrder)
  const orderSummary = useSelector(selectOrderSummary)
  const orderLoading = useSelector(selectOrderLoading)
  const orderError = useSelector(selectOrderError)
  const orderSuccess = useSelector(selectOrderSuccess)
  const shippingRates = useSelector(selectShippingRates)
  const cartItems = useSelector(selectCartItems)
  const cartSummary = useSelector(selectCartSummary)
  const appliedCoupon = useSelector(selectAppliedCoupon)
  const availableCoupons = useSelector((state) => state.coupons.availableCoupons || [])
  const couponLoading = useSelector(selectCouponLoading)
  const couponError = useSelector(selectCouponError)
  const user = useSelector(selectUser)
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phoneNumber?.replace("+91", "") || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
  })
  const [couponCode, setCouponCode] = useState("")
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [addressErrors, setAddressErrors] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [selectedShippingRate, setSelectedShippingRate] = useState(null)
  const [showShippingCalculator, setShowShippingCalculator] = useState(false)
  const [showCongratulationsPopup, setShowCongratulationsPopup] = useState(false)
  const [congratulationsData, setCongratulationsData] = useState({
    couponCode: "",
    savingsAmount: 0,
  })

  // Fix for mobile zoom issue - prevent initial zoom
  useEffect(() => {
    // Reset viewport scale
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes')
    }

    // Force minimum font size for inputs to prevent zoom
    const checkFontSize = () => {
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        const computedStyle = window.getComputedStyle(input)
        const fontSize = parseFloat(computedStyle.fontSize)
        if (fontSize < 16) {
          input.style.fontSize = '16px'
        }
      })
    }

    // Check after a small delay to ensure styles are applied
    setTimeout(checkFontSize, 100)

    return () => {
      // Restore original viewport if needed
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1')
      }
    }
  }, [])

  useEffect(() => {
    // Close existing instance if any
    // Clear any existing order state when checkout page loads
    dispatch(removeCoupon())
    setCouponCode("")
    setShowCouponInput(false)
    if (rzpInstanceRef.current) {
      rzpInstanceRef.current.close()
      rzpInstanceRef.current = null
    }
    // Cleanup on unmount
    return () => {
      if (rzpInstanceRef.current) {
        rzpInstanceRef.current.close()
        rzpInstanceRef.current = null
      }
    }
  }, [])

  // Load available coupons for the logged-in user
  useEffect(() => {
    if (Object.keys(user).length != 0) {
      dispatch(fetchAvailableCoupons())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.discountAmount > 0) {
      setCongratulationsData({
        couponCode: appliedCoupon.code,
        savingsAmount: appliedCoupon.discountAmount,
      })
      setShowCongratulationsPopup(true)
      const timer = setTimeout(() => {
        setShowCongratulationsPopup(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [appliedCoupon])

  // Memoized functions and values
  const validateAddress = useCallback(() => {
    const errors = {}
    if (!shippingAddress.fullName.trim()) errors.fullName = "Full name is required"
    if (!shippingAddress.phoneNumber.trim()) errors.phoneNumber = "Phone number is required"
    else if (!/^[6789]\d{9}$/.test(shippingAddress.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid 10-digit mobile number"
    }
    if (!shippingAddress.addressLine1.trim()) errors.addressLine1 = "Address is required"
    if (!shippingAddress.city.trim()) errors.city = "City is required"
    if (!shippingAddress.state.trim()) errors.state = "State is required"
    if (!shippingAddress.pinCode.trim()) errors.pinCode = "PIN code is required"
    else if (!/^[1-9][0-9]{5}$/.test(shippingAddress.pinCode)) {
      errors.pinCode = "Please enter a valid 6-digit PIN code"
    }
    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }, [shippingAddress])

  const handleAddressChange = useCallback((field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
    setAddressErrors((prev) => ({ ...prev, [field]: "" }))
  }, [])

  const handleApplyCoupon = useCallback(() => {
    if (!couponCode.trim()) return
    const orderValue = isBuyNow ? buyNowProduct.product.price * buyNowProduct.quantity : cartSummary.subtotal || 0
    dispatch(validateCoupon({ code: couponCode, cartTotal: orderValue }))
  }, [couponCode, cartSummary.subtotal, dispatch, isBuyNow, buyNowProduct])

  const handleRemoveCoupon = useCallback(() => {
    dispatch(removeCoupon())
    setCouponCode("")
    setShowCouponInput(false)
  }, [dispatch])

  // Calculate pricing based on Buy Now or Cart flow
  const calculateFinalPricing = useMemo(() => {
    let subtotal = 0
    
    if (isBuyNow && buyNowProduct) {
      // Calculate for Buy Now product
      subtotal = buyNowProduct.product.price * buyNowProduct.quantity
    } else {
      // Calculate for cart items
      subtotal = cartSummary.subtotal || 0
    }
    
    // Updated free shipping threshold from 999 to 399
    const shippingCharges = selectedShippingRate ? selectedShippingRate.freight_charge : subtotal >= 399 ? 0 : 99
    const discount = appliedCoupon?.discountAmount || 0
    // Removed GST (Tax) calculation as per requirement
    const total = Math.round(subtotal + shippingCharges - discount)
    
    return {
      subtotal,
      shippingCharges,
      discount,
      total,
    }
  }, [cartSummary.subtotal, selectedShippingRate, appliedCoupon, isBuyNow, buyNowProduct])

  // Get display items for Buy Now or Cart
  const getDisplayItems = useCallback(() => {
    if (isBuyNow && buyNowProduct) {
      // Return Buy Now product as single item
      return [{
        product: buyNowProduct.product,
        quantity: buyNowProduct.quantity,
        size: buyNowProduct.size,
        color: buyNowProduct.color
      }]
    } else {
      // Return cart items
      return cartItems
    }
  }, [isBuyNow, buyNowProduct, cartItems])

  const handlePlaceOrder = useCallback(() => {
    if (rzpInstanceRef.current) {
      rzpInstanceRef.current.close()
      rzpInstanceRef.current = null
    }
    if (!validateAddress()) {
      alert("Please fill all required address fields")
      return
    }
    
    const displayItems = getDisplayItems()
    if (!displayItems.length) {
      alert("No items to order")
      return
    }

    const orderData = {
      amount: calculateFinalPricing.total,
      items: displayItems.map((item) => ({
        productId: item.product?._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: {
        ...shippingAddress,
        phoneNumber: `+91${shippingAddress.phoneNumber}`,
      },
      couponCode: appliedCoupon?.code || "",
      selectedShippingRate: selectedShippingRate,
      isBuyNow: isBuyNow, // Add flag for Buy Now orders
    }
    dispatch(createRazorpayOrder(orderData))
  }, [validateAddress, getDisplayItems, shippingAddress, appliedCoupon, selectedShippingRate, dispatch, calculateFinalPricing.total, isBuyNow])

  const handlePlaceCodOrder = useCallback(() => {
    if (rzpInstanceRef.current) {
      rzpInstanceRef.current.close()
      rzpInstanceRef.current = null
    }
    if (!validateAddress()) {
      alert("Please fill all required address fields")
      return
    }
    
    const displayItems = getDisplayItems()
    if (!displayItems.length) {
      alert("No items to order")
      return
    }

    const orderData = {
      items: displayItems.map((item) => ({
        productId: item.product?._id,
        quantity: item.quantity || 1,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: {
        ...shippingAddress,
        phoneNumber: `+91${shippingAddress.phoneNumber}`,
      },
      couponCode: appliedCoupon?.code || "",
      selectedShippingRate: selectedShippingRate,
      isBuyNow: isBuyNow, // Add flag for Buy Now orders
    }
    dispatch(placeCodOrder(orderData)).then((result) => {
      if (result.type === "order/placeCodOrder/fulfilled") {
        navigate(`/order-confirmation/${result.payload.order.id}`)
      } else {
        console.error("COD Order failed:", result.error)
        alert("Failed to place COD order. Please try again.")
      }
    })
  }, [validateAddress, getDisplayItems, shippingAddress, appliedCoupon, selectedShippingRate, dispatch, navigate, isBuyNow])

  const handleRazorpayPayment = useCallback(() => {
    if (!razorpayOrder) return
    if (rzpInstanceRef.current) {
      rzpInstanceRef.current.close()
      rzpInstanceRef.current = null
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "KsauniBliss",
      description: "KsauniBliss Purchase",
      order_id: razorpayOrder.id,
      handler: (response) => {
        dispatch(
          verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        ).then((result) => {
          if (result.type === "order/verifyPayment/fulfilled") {
            navigate(`/order-confirmation/${result.payload.order.id}`)
          }
        })
      },
      prefill: {
        name: shippingAddress.fullName,
        email: user?.email || "",
        contact: `+91${shippingAddress.phoneNumber}`,
      },
      theme: {
        color: "#ec4899",
      },
      modal: {
        ondismiss: () => {
          rzpInstanceRef.current = null
          window.location.reload()
        },
      },
    }
    if (window.Razorpay) {
      rzpInstanceRef.current = new window.Razorpay(options)
      rzpInstanceRef.current.open()
    } else {
      console.error("Razorpay SDK not loaded")
      alert("Payment gateway not available. Please try again.")
    }
  }, [razorpayOrder, shippingAddress, user, dispatch, navigate])

  const handleShippingRateSelect = useCallback((rate) => {
    setSelectedShippingRate(rate)
    setShowShippingCalculator(false)
  }, [])

  // Effects
  useEffect(() => {
    if (user?.name && !shippingAddress.fullName) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.name,
        phoneNumber: user.phoneNumber?.replace("+91", "") || "",
      }))
    }
  }, [user, shippingAddress.fullName])

  useEffect(() => {
    // Only fetch cart if this is not a Buy Now flow
    if (!isBuyNow && !cartItems.length) {
      dispatch(fetchCart())
    }
  }, [dispatch, cartItems.length, isBuyNow])

  useEffect(() => {
    if (orderSuccess.orderCreated && razorpayOrder) {
      handleRazorpayPayment()
    }
  }, [orderSuccess.orderCreated, razorpayOrder, handleRazorpayPayment])

  useEffect(() => {
    if (orderError) {
      const timer = setTimeout(() => dispatch(clearError()), 5000)
      return () => clearTimeout(timer)
    }
  }, [orderError, dispatch])

  useEffect(() => {
    if (couponError) {
      const timer = setTimeout(() => dispatch(clearCouponError()), 5000)
      return () => clearTimeout(timer)
    }
  }, [couponError, dispatch])

  // Check if there are items to display
  const displayItems = getDisplayItems()
  const hasItems = displayItems.length > 0

  if (!hasItems && !orderLoading.creating) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 safe-area-bottom">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400 xs:w-16 xs:h-16" />
          <h2 className="mb-2 text-xl font-bold text-gray-800 xs:text-2xl">No items to checkout</h2>
          <p className="mb-4 text-sm text-gray-600 xs:text-base">
            {isBuyNow ? "Buy Now product not found" : "Add some items to your cart to proceed with checkout"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm text-white transition-colors bg-red-600 rounded-lg xs:px-6 xs:text-base hover:bg-red-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-20 safe-area-bottom prevent-zoom">
      {/* Added prevent-zoom class */}
      <style jsx>{`
        .prevent-zoom {
          font-size: 16px; /* Base font size to prevent zoom */
        }
        .prevent-zoom input, 
        .prevent-zoom select, 
        .prevent-zoom textarea {
          font-size: 16px !important; /* Force 16px to prevent zoom on focus */
          min-height: 44px; /* Minimum touch target size */
        }
        @media (max-width: 640px) {
          .prevent-zoom {
            touch-action: pan-y pinch-zoom; /* Better touch handling */
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 xs:py-6 lg:py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-6xl mx-auto"
        >
          {/* Header - Responsive */}
          <div className="mb-4 xs:mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="mb-1 xs:mb-2 text-xl xs:text-2xl font-bold text-gray-800">
              Checkout {isBuyNow && "(Buy Now)"}
            </h1>
            <p className="text-xs xs:text-sm text-gray-600">
              {isBuyNow ? "Complete your purchase" : "Review your order and complete your purchase"}
            </p>
          </div>
          
          {/* Error Display - Responsive */}
          {(orderError || couponError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-2 xs:py-3 mb-3 xs:mb-4 text-xs xs:text-sm border border-red-200 rounded-lg bg-red-50 text-red-700"
            >
              {orderError || couponError}
            </motion.div>
          )}
          
          <div className="grid gap-3 xs:gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
            {/* Left Column - Forms - Responsive */}
            <div className="space-y-3 xs:space-y-4 sm:space-y-6 lg:col-span-2">
              {/* Shipping Address - Responsive */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 xs:p-4 sm:p-6 bg-white rounded-xl shadow-sm xs:shadow-md"
              >
                <div className="flex items-center mb-3 xs:mb-4">
                  <MapPin className="w-4 h-4 mr-2 text-red-600 xs:w-5 xs:h-5" />
                  <h2 className="text-base xs:text-lg font-semibold">Shipping Address</h2>
                </div>
                <div className="grid gap-2 xs:gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange("fullName", e.target.value)}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        addressErrors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {addressErrors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.fullName}</p>
                    )}
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700">Phone Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-3 text-base border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={shippingAddress.phoneNumber}
                        onChange={(e) =>
                          handleAddressChange("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className={`w-full px-3 py-3 text-base border rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          addressErrors.phoneNumber ? "border-red-500 border-l-0" : "border-gray-300 border-l-0"
                        }`}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {addressErrors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.phoneNumber}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700">Address Line 1 *</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => handleAddressChange("addressLine1", e.target.value)}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        addressErrors.addressLine1 ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="House/Flat No., Building Name, Street"
                    />
                    {addressErrors.addressLine1 && (
                      <p className="mt-1 text-xs text-red-500">{addressErrors.addressLine1}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        addressErrors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your city"
                    />
                    {addressErrors.city && <p className="mt-1 text-xs text-red-500">{addressErrors.city}</p>}
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        addressErrors.state ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your state"
                    />
                    {addressErrors.state && <p className="mt-1 text-xs text-red-500">{addressErrors.state}</p>}
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700">PIN Code *</label>
                    <input
                      type="text"
                      value={shippingAddress.pinCode}
                      onChange={(e) => handleAddressChange("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        addressErrors.pinCode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="6-digit PIN code"
                    />
                    {addressErrors.pinCode && <p className="mt-1 text-xs text-red-500">{addressErrors.pinCode}</p>}
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700">Landmark</label>
                    <input
                      type="text"
                      value={shippingAddress.landmark}
                      onChange={(e) => handleAddressChange("landmark", e.target.value)}
                      className="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Nearby landmark (Optional)"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Coupon Section - Responsive */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 xs:p-4 sm:p-6 bg-white rounded-xl shadow-sm xs:shadow-md"
              >
                <div className="flex items-center mb-3 xs:mb-4">
                  <Tag className="w-4 h-4 mr-2 text-red-600 xs:w-5 xs:h-5" />
                  <h2 className="text-base xs:text-lg font-semibold">Promo Code</h2>
                </div>
                {appliedCoupon ? (
                  <div className="flex flex-col justify-between p-3 space-y-2 border border-green-200 rounded-lg xs:flex-row xs:items-center bg-green-50 xs:space-y-0">
                    <div>
                      <p className="text-sm font-medium text-green-800">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">You saved ₹{appliedCoupon.discountAmount}!</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="self-start p-1 text-red-500 hover:text-red-700 xs:self-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 xs:p-4 bg-white border rounded-lg">
                    {/* Header / Toggle */}
                    {!showCouponInput ? (
                      <button
                        onClick={() => setShowCouponInput(true)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Have a promo code? Click here to apply
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 xs:flex-row">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter promo code"
                          className="flex-1 px-3 py-3 text-base border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim() || couponLoading?.validating}
                            className="px-3 xs:px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg disabled:opacity-50 hover:bg-red-700"
                          >
                            {couponLoading?.validating ? "Applying..." : "Apply"}
                          </button>
                          {appliedCoupon && (
                            <button
                              onClick={handleRemoveCoupon}
                              className="px-3 xs:px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Available Coupons (ALWAYS under the input/toggle) */}
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-semibold text-gray-700">Available Coupons</div>
                      {availableCoupons.length === 0 ? (
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between text-xs text-gray-500">
                          <span className="mb-2 xs:mb-0">No active coupons right now. (To View Coupons please login)</span>
                          <button
                            // onClick={() => navigate("/login")}
                             onClick={() => navigate("/login", {
                              state: { from: "/checkout" }
                            })}
                            className="px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                          >
                            Login
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {availableCoupons.map((c) => {
                            const subtotal = calculateFinalPricing.subtotal || 0
                            const min = c.minOrderValue || 0
                            const eligible = subtotal >= min
                            const shortBy = Math.max(0, min - subtotal)
                            return (
                              <div
                                key={c.code}
                                className="flex items-center justify-between p-2 border border-gray-200 rounded-lg"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-mono font-semibold">{c.code}</span>
                                  {c.description && <span className="text-xs text-gray-600">{c.description}</span>}
                                  {min > 0 && <span className="text-xs text-gray-500">Min order: ₹{min}</span>}
                                </div>
                                <button
                                  className="px-2 xs:px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg disabled:opacity-50 hover:bg-red-700"
                                  disabled={!eligible}
                                  onClick={() => {
                                    setShowCouponInput(true)
                                    setCouponCode(c.code)
                                    const orderValue = calculateFinalPricing.subtotal || 0
                                    dispatch(
                                      validateCoupon({
                                        code: c.code,
                                        cartTotal: orderValue,
                                      }),
                                    )
                                  }}
                                >
                                  {eligible ? "Apply" : `Add ₹${shortBy} more`}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Right Column - Order Summary - Responsive */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky p-3 xs:p-4 sm:p-6 bg-white rounded-xl shadow-sm xs:shadow-md top-4"
              >
                <h2 className="mb-3 xs:mb-4 text-base xs:text-lg font-semibold">
                  Order Summary {isBuyNow && "(Buy Now)"}
                </h2>
                
                {/* Buy Now Notice */}
                {isBuyNow && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium">
                      🚀 Quick Purchase: You're buying this item directly
                    </p>
                  </div>
                )}
                
                {/* Cart Items - Responsive */}
                <div className="mb-3 xs:mb-4 space-y-2 xs:space-y-3">
                  {displayItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 xs:space-x-3">
                      <img
                        src={
                          item.product?.images?.[0]?.url || "/placeholder.svg?height=64&width=64" || "/placeholder.svg"
                        }
                        alt={item.product?.name || "Product"}
                        className="object-cover w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs xs:text-sm font-medium truncate">
                          {item.product?.name || "Product Name"}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Size: {item.size || "M"} | Qty: {item.quantity || 1}
                          {item.color && ` | Color: ${item.color}`}
                        </p>
                        <p className="text-xs xs:text-sm font-semibold">
                          ₹{(item.product?.price || 0) * (item.quantity || 1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pricing Breakdown - Responsive */}
                <div className="pt-3 xs:pt-4 space-y-2 border-t border-gray-200">
                  <div className="flex justify-between text-xs xs:text-sm">
                    <span>Subtotal ({displayItems.length} {displayItems.length === 1 ? 'item' : 'items'})</span>
                    <span>₹{calculateFinalPricing.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs xs:text-sm">
                    <span>Shipping</span>
                    <span className={calculateFinalPricing.shippingCharges === 0 ? "text-green-600" : ""}>
                      {calculateFinalPricing.shippingCharges === 0
                        ? "FREE"
                        : `₹${calculateFinalPricing.shippingCharges}`}
                    </span>
                  </div>
                  {selectedShippingRate && (
                    <div className="text-xs text-gray-500">via {selectedShippingRate.courier_name}</div>
                  )}
                  {calculateFinalPricing.shippingCharges === 0 && !selectedShippingRate && (
                    <div className="flex items-center text-xs text-green-600">
                      <Truck className="w-3 h-3 mr-1" />
                      <span>Free shipping on orders above ₹399</span>
                    </div>
                  )}
                  {calculateFinalPricing.discount > 0 && (
                    <div className="flex justify-between text-xs xs:text-sm text-green-600">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-₹{calculateFinalPricing.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 text-sm xs:text-base font-semibold border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{calculateFinalPricing.total}</span>
                  </div>
                </div>
                {/* Security Badge - Responsive */}
                <div className="flex items-center justify-center mt-3 xs:mt-4 text-xs text-gray-600">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>Secure checkout powered by Razorpay</span>
                </div>

                <div className="hidden md:block mt-6">
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={orderLoading.creating || !displayItems.length}
                    className="flex items-center justify-center w-full py-3 text-base font-semibold text-white bg-red-600 rounded-[10px] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-colors"
                  >
                    {orderLoading.creating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Confirm Order ₹{calculateFinalPricing.total}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Fixed Bottom Button for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 xs:p-4 z-40 safe-area-bottom md:hidden">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setShowModal(true)}
              disabled={orderLoading.creating || !displayItems.length}
              className="flex items-center justify-center w-full py-3 text-sm xs:text-base font-semibold text-white bg-red-600 rounded-[10px] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-colors"
            >
              {orderLoading.creating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 xs:w-5 xs:h-5 mr-2" />
                  Confirm Order ₹{calculateFinalPricing.total}
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Payment Modal */}
        {showModal && (
          <PaymentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onOnline={handlePlaceOrder}
            onCOD={() => {
              handlePlaceCodOrder()
              setShowModal(false)
            }}
            amount={calculateFinalPricing.total}
          />
        )}
        
        {/* Congratulations Popup */}
        {showCongratulationsPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm safe-area-top safe-area-bottom">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-md p-4 xs:p-6 bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setShowCongratulationsPopup(false)}
                className="absolute top-2 right-2 xs:top-4 xs:right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="w-4 h-4 xs:w-5 xs:h-5" />
              </button>

              {/* Celebration content */}
              <div className="text-center relative z-10">
                {/* Celebration emoji/icon */}
                <div className="mb-3 xs:mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 xs:w-16 xs:h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                    <span className="text-2xl xs:text-3xl animate-bounce">🎉</span>
                  </div>
                </div>

                {/* Main message */}
                <h2 className="mb-1 xs:mb-2 text-xl xs:text-2xl font-bold text-gray-900">Congratulations!</h2>
                <p className="mb-3 xs:mb-4 text-sm xs:text-base text-gray-600">Your promo code has been applied successfully!</p>

                {/* Savings details */}
                <div className="p-3 xs:p-4 mb-4 xs:mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1 xs:mb-2">
                    <span className="text-xs xs:text-sm font-medium text-green-800">Code: {congratulationsData.couponCode}</span>
                    <span className="text-base xs:text-lg font-bold text-green-600">₹{congratulationsData.savingsAmount} OFF</span>
                  </div>
                  <p className="text-xs text-green-600">
                    You saved ₹{congratulationsData.savingsAmount} on your order!
                  </p>
                </div>

                {/* Action button */}
                <button
                  onClick={() => setShowCongratulationsPopup(false)}
                  className="w-full px-4 xs:px-6 py-2 xs:py-3 text-sm xs:text-base text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Enhanced decorative elements with better positioning */}
              <div className="absolute top-1 left-1 xs:top-2 xs:left-2 w-3 h-3 xs:w-4 xs:h-4 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
              <div
                className="absolute top-2 right-4 xs:top-3 xs:right-8 w-2 h-2 xs:w-3 xs:h-3 bg-red-400 rounded-full animate-bounce opacity-80"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="absolute bottom-6 left-2 xs:bottom-8 xs:left-4 w-2 h-2 xs:w-3 xs:h-3 bg-blue-400 rounded-full animate-bounce opacity-80"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <div
                className="absolute bottom-3 right-4 xs:bottom-4 xs:right-6 w-1 h-1 xs:w-2 xs:h-2 bg-purple-400 rounded-full animate-bounce opacity-80"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage