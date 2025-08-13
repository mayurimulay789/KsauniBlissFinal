"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon } from "@heroicons/react/24/outline"
import { fetchAllOrders, updateOrderStatus } from "../../store/slices/adminSlice"
import LoadingSpinner from "../LoadingSpinner"

const OrdersManagement = () => {
  const dispatch = useDispatch()
  const { orders, ordersPagination, ordersLoading } = useSelector((state) => state.admin)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    status: "",
    startDate: "",
    endDate: "",
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    trackingNumber: "",
    carrier: "",
    notes: "",
  })

  useEffect(() => {
    dispatch(fetchAllOrders(filters))
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order)
    setStatusUpdate({
      status: order.status,
      trackingNumber: order.trackingInfo?.trackingNumber || "",
      carrier: order.trackingInfo?.carrier || "",
      notes: order.notes || "",
    })
    setShowStatusModal(true)
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    if (selectedOrder) {
      await dispatch(
        updateOrderStatus({
          orderId: selectedOrder._id,
          ...statusUpdate,
        }),
      )
      setShowStatusModal(false)
      setSelectedOrder(null)
      setStatusUpdate({ status: "", trackingNumber: "", carrier: "", notes: "" })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ]

  if (ordersLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="block w-full py-2 pl-10 pr-3 leading-5 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="block w-full px-3 py-2 leading-5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="block w-full px-3 py-2 leading-5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="block w-full px-3 py-2 leading-5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 20,
                  search: "",
                  status: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.items.length} items</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.user?.name || "Guest"}</div>
                      <div className="text-sm text-gray-500">{order.user?.phoneNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(order.pricing.total)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewOrder(order)} className="text-pink-600 hover:text-pink-900">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleUpdateStatus(order)} className="text-blue-600 hover:text-blue-900">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {ordersPagination && ordersPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(ordersPagination.currentPage - 1)}
                disabled={!ordersPagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(ordersPagination.currentPage + 1)}
                disabled={!ordersPagination.hasNext}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(ordersPagination.currentPage - 1) * filters.limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(ordersPagination.currentPage * filters.limit, ordersPagination.totalOrders)}
                  </span>{" "}
                  of <span className="font-medium">{ordersPagination.totalOrders}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => handlePageChange(ordersPagination.currentPage - 1)}
                    disabled={!ordersPagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(ordersPagination.currentPage + 1)}
                    disabled={!ordersPagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Order Details - {selectedOrder.orderNumber}</h3>
                <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Order Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Order Information</h4>
                    <div className="p-4 space-y-2 rounded-lg bg-gray-50">
                      <p>
                        <span className="font-medium">Order Number:</span> {selectedOrder.orderNumber}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedOrder.status)}`}
                        >
                          {selectedOrder.status.replace("_", " ")}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Total:</span> {formatCurrency(selectedOrder.pricing.total)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Customer Information</h4>
                    <div className="p-4 space-y-2 rounded-lg bg-gray-50">
                      <p>
                        <span className="font-medium">Name:</span> {selectedOrder.user?.name || "Guest"}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {selectedOrder.user?.phoneNumber}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {selectedOrder.user?.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Shipping Address</h4>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p>{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <p>{selectedOrder.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                        {selectedOrder.shippingAddress.pinCode}
                      </p>
                      <p>Phone: {selectedOrder.shippingAddress.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center p-4 space-x-4 rounded-lg bg-gray-50">
                        <img
                          src={item.image?.url || "/placeholder.svg?height=60&width=60"}
                          alt={item.name}
                          className="object-cover rounded h-15 w-15"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Size: {item.size} | Color: {item.color}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-4 mt-4 rounded-lg bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{formatCurrency(selectedOrder.pricing.shippingCharges)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedOrder.pricing.tax)}</span>
                      </div>
                      {selectedOrder.pricing.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(selectedOrder.pricing.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 text-lg font-medium border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.pricing.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleStatusSubmit}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Update Order Status</h3>
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Order Number</label>
                    <input
                      type="text"
                      value={selectedOrder.orderNumber}
                      disabled
                      className="block w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Status *</label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate((prev) => ({ ...prev, status: e.target.value }))}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {statusUpdate.status === "shipped" && (
                    <>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Tracking Number</label>
                        <input
                          type="text"
                          value={statusUpdate.trackingNumber}
                          onChange={(e) => setStatusUpdate((prev) => ({ ...prev, trackingNumber: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter tracking number"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Carrier</label>
                        <select
                          value={statusUpdate.carrier}
                          onChange={(e) => setStatusUpdate((prev) => ({ ...prev, carrier: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        >
                          <option value="">Select Carrier</option>
                          <option value="shiprocket">Shiprocket</option>
                          <option value="delhivery">Delhivery</option>
                          <option value="bluedart">Blue Dart</option>
                          <option value="dtdc">DTDC</option>
                          <option value="fedex">FedEx</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Add any notes about this status update..."
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersManagement
