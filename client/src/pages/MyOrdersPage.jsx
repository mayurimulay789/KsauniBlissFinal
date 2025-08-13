"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Package, Eye, X, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { fetchUserOrders, cancelOrder, clearError } from "../store/slices/orderSlice"
import LoadingSpinner from "../components/LoadingSpinner"

const MyOrdersPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { orders = [], pagination = {}, loading = {}, error } = useSelector((state) => state.orders || {})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchUserOrders({ page: currentPage, limit: 10 }))
    console.log("Image URL:", orders[0]?.items?.[0]?.product?.images?.[0]?.url)
  }, [dispatch, currentPage])

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000)
    }
  }, [error, dispatch])

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "processing":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-600" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "cancelled":
        return <X className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-100"
      case "processing":
        return "text-blue-600 bg-blue-100"
      case "shipped":
        return "text-purple-600 bg-purple-100"
      case "delivered":
        return "text-green-600 bg-green-100"
      case "cancelled":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Order Confirmed"
      case "processing":
        return "Processing"
      case "shipped":
        return "Shipped"
      case "delivered":
        return "Delivered"
      case "cancelled":
        return "Cancelled"
      default:
        return "Pending"
    }
  }

  const canCancelOrder = (order) => {
    return order.status === "confirmed" || order.status === "processing"
  }

  const handleCancelOrder = () => {
    if (!selectedOrder || !cancelReason.trim()) return

    dispatch(
      cancelOrder({
        orderId: selectedOrder._id,
        reason: cancelReason,
      }),
    ).then((result) => {
      if (result.type === "order/cancelOrder/fulfilled") {
        setShowCancelModal(false)
        setSelectedOrder(null)
        setCancelReason("")
      }
    })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading?.fetching && !orders.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container px-4 mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50"
            >
              {error}
            </motion.div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold text-gray-800">No orders yet</h2>
              <p className="mb-6 text-gray-600">Start shopping to see your orders here</p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
              >
                Start Shopping
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden bg-white rounded-lg shadow-md"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center mb-4 space-x-4 lg:mb-0">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="text-lg font-semibold">Order #{order?.orderNumber || "N/A"}</h3>
                          <p className="text-sm text-gray-600">
                            Placed on{" "}
                            {order?.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-lg font-semibold">₹{order?.pricing?.total || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    {order?.items && order.items.length > 0 && (
                      <div className="flex items-center mb-4 space-x-4">
                        {order.items.slice(0, 3).map((item, itemIndex) => (
                          <img
                            key={itemIndex}
                            src={item?.product?.images?.[0]?.url || "/placeholder.svg"}
                            alt={item?.product?.name || "Product"}
                            className="object-cover w-16 h-16 rounded-lg"
                          />
                        ))}

                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
                            <span className="text-sm text-gray-600">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-4 sm:mb-0">
                        <p className="text-sm text-gray-600">
                          {order?.items?.length || 0} item{(order?.items?.length || 0) > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-gray-600">
                          Delivered to {order?.shippingAddress?.city || "N/A"}, {order?.shippingAddress?.state || "N/A"}
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        {/* <button
                          onClick={() => navigate(`/order/${order._id}`)}
                          className="flex items-center px-4 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>

                        <OrderTracking orderId={order._id} /> */}

                        {canCancelOrder(order) && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowCancelModal(true)
                            }}
                            className="flex items-center px-4 py-2 text-red-600 transition-colors border border-red-300 rounded-lg hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg ${
                      page === currentPage
                        ? "bg-pink-600 text-white border-pink-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 bg-white rounded-lg"
          >
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
              <h3 className="text-lg font-semibold">Cancel Order</h3>
            </div>

            <p className="mb-4 text-gray-600">Are you sure you want to cancel order #{selectedOrder?.orderNumber}?</p>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Reason for cancellation *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedOrder(null)
                  setCancelReason("")
                }}
                className="flex-1 px-4 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || loading?.cancelling}
                className="flex-1 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading?.cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MyOrdersPage
