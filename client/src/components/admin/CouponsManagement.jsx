"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../store/slices/adminSlice"
import LoadingSpinner from "../LoadingSpinner"

const CouponsManagement = () => {
  const dispatch = useDispatch()
  const { coupons, couponsPagination, couponsLoading } = useSelector((state) => state.admin)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    isActive: "",
  })
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    maxUses: "",
    maxUsesPerUser: "1",
    validUntil: "",
    isActive: true,
  })

  useEffect(() => {
    dispatch(fetchAllCoupons(filters))
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const handleAddCoupon = () => {
    setEditingCoupon(null)
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderValue: "",
      maxDiscountAmount: "",
      maxUses: "",
      maxUsesPerUser: "1",
      validUntil: "",
      isActive: true,
    })
    setShowModal(true)
  }

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderValue: coupon.minOrderValue.toString(),
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      maxUses: coupon.maxUses?.toString() || "",
      maxUsesPerUser: coupon.maxUsesPerUser.toString(),
      validUntil: new Date(coupon.validUntil).toISOString().split("T")[0],
      isActive: coupon.isActive,
    })
    setShowModal(true)
  }

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      await dispatch(deleteCoupon(couponId))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const couponData = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderValue: Number(formData.minOrderValue) || 0,
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
      maxUsesPerUser: Number(formData.maxUsesPerUser),
    }

    if (editingCoupon) {
      await dispatch(updateCoupon({ couponId: editingCoupon._id, couponData }))
    } else {
      await dispatch(createCoupon(couponData))
    }

    setShowModal(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`
  }

  if (couponsLoading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-2 space-y-3 sm:p-4 sm:space-y-4">
      {/* Filters with Add Button */}
      <div className="p-3 bg-white rounded-lg shadow">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">Status</label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="block w-full px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
              >
                <option value="">All Coupons</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="sm:ml-3">
            <button
              onClick={handleAddCoupon}
              className="inline-flex items-center justify-center w-full px-3 py-1 text-sm text-white bg-red-600 border border-transparent rounded shadow-sm hover:bg-red-700 sm:w-auto"
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Add Coupon
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Table - Mobile Responsive */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        {/* Mobile Cards View */}
        <div className="block sm:hidden">
          <div className="divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                    <div className="text-sm text-gray-500">{coupon.description}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEditCoupon(coupon)} className="text-blue-600 hover:text-blue-900">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCoupon(coupon._id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Discount:</span>
                    <div className="text-gray-900">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Usage:</span>
                    <div className="text-gray-900">
                      {coupon.usedCount} / {coupon.maxUses || "∞"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Valid Until:</span>
                    <div className="text-gray-900">{formatDate(coupon.validUntil)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        coupon.isActive && new Date(coupon.validUntil) > new Date()
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {coupon.isActive && new Date(coupon.validUntil) > new Date() ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                        <div className="text-sm text-gray-500">{coupon.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)}
                      </div>
                      <div className="text-sm text-gray-500">Min: {formatCurrency(coupon.minOrderValue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.usedCount} / {coupon.maxUses || "∞"}
                      </div>
                      <div className="text-sm text-gray-500">Max per user: {coupon.maxUsesPerUser}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(coupon.validUntil)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coupon.isActive && new Date(coupon.validUntil) > new Date()
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {coupon.isActive && new Date(coupon.validUntil) > new Date() ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditCoupon(coupon)} className="text-blue-600 hover:text-blue-900">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {couponsPagination && couponsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(couponsPagination.currentPage - 1)}
                disabled={!couponsPagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(couponsPagination.currentPage + 1)}
                disabled={!couponsPagination.hasNext}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(couponsPagination.currentPage - 1) * filters.limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(couponsPagination.currentPage * filters.limit, couponsPagination.totalCoupons)}
                  </span>{" "}
                  of <span className="font-medium">{couponsPagination.totalCoupons}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => handlePageChange(couponsPagination.currentPage - 1)}
                    disabled={!couponsPagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(couponsPagination.currentPage + 1)}
                    disabled={!couponsPagination.hasNext}
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

      {/* Add/Edit Coupon Modal - Compact */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-2 overflow-y-auto bg-gray-500 bg-opacity-75">
          <div className="w-full max-w-2xl my-4 bg-white rounded-lg shadow-xl">
            <div className="flex flex-col">
              {/* Modal Header - Compact */}
              <div className="flex items-center justify-between p-3 border-b">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
                <h3 className="text-base font-medium text-gray-900">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h3>
                <button
                  onClick={handleAddCoupon}
                  className="flex items-center px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                >
                  <PlusIcon className="w-3 h-3 mr-1" />
                  Add Coupon
                </button>
              </div>

              {/* Modal Body - Compact Form */}
              <div className="p-3">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-700">Coupon Code *</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        required
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                        placeholder="e.g., SUMMER20"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-700">Description *</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        required
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                        placeholder="e.g., Summer Sale - 20% off"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Discount Type *</label>
                        <select
                          value={formData.discountType}
                          onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value }))}
                          required
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="flat">Flat Amount</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Discount Value *</label>
                        <input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: e.target.value }))}
                          required
                          min="0"
                          step={formData.discountType === "percentage" ? "1" : "0.01"}
                          max={formData.discountType === "percentage" ? "100" : undefined}
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder={formData.discountType === "percentage" ? "20" : "100"}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Min Order Value</label>
                        <input
                          type="number"
                          value={formData.minOrderValue}
                          onChange={(e) => setFormData((prev) => ({ ...prev, minOrderValue: e.target.value }))}
                          min="0"
                          step="0.01"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Max Discount Amount</label>
                        <input
                          type="number"
                          value={formData.maxDiscountAmount}
                          onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))}
                          min="0"
                          step="0.01"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="No limit"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Max Total Uses</label>
                        <input
                          type="number"
                          value={formData.maxUses}
                          onChange={(e) => setFormData((prev) => ({ ...prev, maxUses: e.target.value }))}
                          min="1"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="Unlimited"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-700">Max Uses Per User *</label>
                        <input
                          type="number"
                          value={formData.maxUsesPerUser}
                          onChange={(e) => setFormData((prev) => ({ ...prev, maxUsesPerUser: e.target.value }))}
                          required
                          min="1"
                          className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-700">Valid Until *</label>
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData((prev) => ({ ...prev, validUntil: e.target.value }))}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="isActive" className="block ml-2 text-sm text-gray-900">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="flex pt-3 mt-4 space-x-2 border-t">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      {editingCoupon ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CouponsManagement
