"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Heart,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  ShoppingCart,
} from "lucide-react"
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  optimisticUpdateQuantity,
  optimisticRemoveFromCart,
} from "../store/slices/cartSlice"
import { addToWishlist, optimisticAddToWishlist } from "../store/slices/wishlistSlice"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const CartPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { items, summary, isLoading, error } = useSelector((state) => state.cart)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  const [updatingItems, setUpdatingItems] = useState(new Set())

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return

    // Optimistic update for immediate UI feedback
    dispatch(optimisticUpdateQuantity({ itemId, quantity: newQuantity }))

    setUpdatingItems((prev) => new Set(prev).add(itemId))

    try {
      // Then sync with server
      await dispatch(updateCartItem({ itemId, data: { quantity: newQuantity } })).unwrap()
    } catch (error) {
      console.error("Update quantity error:", error)
      toast.error(error?.message || "Failed to update quantity")
      // Revert optimistic update by refetching cart
      dispatch(fetchCart())
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (itemId, productName) => {
    try {
      // Optimistic update for immediate UI feedback
      dispatch(optimisticRemoveFromCart(itemId))
      toast.success(`${productName} removed from cart`)

      // Visual feedback on cart icon
      const bagElement = document.querySelector("#bag")
      if (bagElement) {
        bagElement.style.transform = "scale(1.2)"
        setTimeout(() => {
          bagElement.style.transform = "scale(1)"
        }, 200)
      }

      // Then sync with server
      await dispatch(removeFromCart(itemId)).unwrap()
    } catch (error) {
      console.error("Remove from cart error:", error)
      toast.error(error?.message || "Failed to remove from cart")
    }
  }

  const handleMoveToWishlist = async (item) => {
    try {
      // Optimistic updates for both cart and wishlist
      dispatch(optimisticAddToWishlist(item.product))
      dispatch(optimisticRemoveFromCart(item._id))

      toast.success(`${item.product.name} moved to wishlist`)

      // Visual feedback on both icons
      const bagElement = document.querySelector("#bag")
      const wishElement = document.querySelector("#wish")

      if (bagElement) {
        bagElement.style.transform = "scale(1.2)"
        setTimeout(() => {
          bagElement.style.transform = "scale(1)"
        }, 200)
      }

      if (wishElement) {
        wishElement.style.transform = "scale(1.2)"
        setTimeout(() => {
          wishElement.style.transform = "scale(1)"
        }, 200)
      }

      // Then sync with server
      await dispatch(addToWishlist(item.product._id)).unwrap()
      await dispatch(removeFromCart(item._id)).unwrap()
    } catch (error) {
      console.error("Move to wishlist error:", error)
      toast.error(error?.message || "Failed to move to wishlist")
    }
  }

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await dispatch(clearCart()).unwrap()
        toast.success("Cart cleared successfully")
      } catch (error) {
        toast.error(error?.message || "Failed to clear cart")
      }
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId)
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="pt-28 md:pt-32">
        <LoadingSpinner message="Loading your cart..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 md:pt-32">
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 transition-colors rounded-full hover:bg-gray-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Shopping Cart</h1>
              <p className="text-gray-600">
                {summary.totalItems} {summary.totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <motion.button
              onClick={handleClearCart}
              className="font-medium text-red-600 transition-colors hover:text-red-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Cart
            </motion.button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Your cart is empty</h2>
            <p className="max-w-md mx-auto mb-8 text-gray-600">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 space-x-2 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white rounded-lg shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-full h-32 md:w-32">
                        <img
                          src={item.product.images[0]?.url || "/placeholder.svg?height=128&width=128"}
                          alt={item.product.name}
                          className="object-cover w-full h-full rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            to={`/product/${item.product._id}`}
                            className="text-lg font-semibold text-gray-800 transition-colors hover:text-pink-600 line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <motion.button
                            onClick={() => handleRemoveItem(item._id, item.product.name)}
                            className="p-1 text-gray-400 transition-colors hover:text-red-500"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>

                        {/* Size and Color */}
                        <div className="flex items-center mb-3 space-x-4 text-sm text-gray-600">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-800">₹{item.product.price}</span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <span className="text-sm text-gray-500 line-through">₹{item.product.originalPrice}</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <motion.button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updatingItems.has(item._id)}
                                className="p-2 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>
                              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                {updatingItems.has(item._id) ? "..." : item.quantity}
                              </span>
                              <motion.button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={item.quantity >= 10 || updatingItems.has(item._id)}
                                className="p-2 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>

                            {/* Move to Wishlist */}
                            {!isInWishlist(item.product._id) && (
                              <motion.button
                                onClick={() => handleMoveToWishlist(item)}
                                className="p-2 text-gray-400 transition-colors hover:text-pink-500"
                                title="Move to Wishlist"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Heart className="w-5 h-5" />
                              </motion.button>
                            )}
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-3 text-right">
                          <span className="text-lg font-bold text-gray-800">₹{item.itemTotal}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky p-6 bg-white rounded-lg shadow-sm top-4"
              >
                <h3 className="mb-6 text-xl font-semibold text-gray-800">Order Summary</h3>

                {/* Summary Details */}
                <div className="mb-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({summary.totalItems} items)</span>
                    <span className="font-medium">₹{summary.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {summary.shipping === 0 ? <span className="text-green-600">Free</span> : `₹${summary.shipping}`}
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{summary.total}</span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Banner */}
                {summary.subtotal < 999 && (
                  <div className="p-3 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Add ₹{999 - summary.subtotal} more for free shipping!
                      </span>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <motion.button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-3 mb-4 font-medium text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed to Checkout
                </motion.button>

                {/* Continue Shopping */}
                <Link
                  to="/products"
                  className="block w-full py-3 font-medium text-center text-gray-700 transition-colors border border-gray-300 rounded-lg hover:border-gray-400"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="pt-6 mt-6 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <Shield className="w-6 h-6 mb-2 text-green-600" />
                      <span className="text-xs text-gray-600">Secure Payment</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Truck className="w-6 h-6 mb-2 text-blue-600" />
                      <span className="text-xs text-gray-600">Fast Delivery</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <RotateCcw className="w-6 h-6 mb-2 text-purple-600" />
                      <span className="text-xs text-gray-600">Easy Returns</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
