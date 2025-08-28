import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import adminAPI from "../api/adminAPI"

// Dashboard Stats
export const fetchDashboardStats = createAsyncThunk("admin/fetchDashboardStats", async (_, { rejectWithValue }) => {
  try {
    const response = await adminAPI.getDashboardStats()
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard stats")
  }
})

// User Management
export const fetchAllUsers = createAsyncThunk("admin/fetchAllUsers", async (params, { rejectWithValue }) => {
  try {
    const response = await adminAPI.getAllUsers(params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users")
  }
})

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUserRole(userId, { role })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user role")
    }
  },
)

export const deleteUser = createAsyncThunk("admin/deleteUser", async (userId, { rejectWithValue }) => {
  try {
    await adminAPI.deleteUser(userId)
    return userId
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete user")
  }
})

// Order Management
export const fetchAllOrders = createAsyncThunk("admin/fetchAllOrders", async (params, { rejectWithValue }) => {
  try {
    const response = await adminAPI.getAllOrders(params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch orders")
  }
})

export const updateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async ({ orderId, status, trackingNumber, carrier, notes }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, {
        status,
        trackingNumber,
        carrier,
        notes,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order status")
    }
  },
)

// Coupon Management
export const fetchAllCoupons = createAsyncThunk("admin/fetchAllCoupons", async (params, { rejectWithValue }) => {
  try {
    const response = await adminAPI.getAllCoupons(params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch coupons")
  }
})

export const createCoupon = createAsyncThunk("admin/createCoupon", async (couponData, { rejectWithValue }) => {
  try {
    const response = await adminAPI.createCoupon(couponData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to create coupon")
  }
})

export const updateCoupon = createAsyncThunk(
  "admin/updateCoupon",
  async ({ couponId, couponData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateCoupon(couponId, couponData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update coupon")
    }
  },
)

export const deleteCoupon = createAsyncThunk("admin/deleteCoupon", async (couponId, { rejectWithValue }) => {
  try {
    await adminAPI.deleteCoupon(couponId)
    return couponId
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete coupon")
  }
})

const initialState = {
  // Dashboard
  dashboardStats: null,
  dashboardLoading: false,

  // Users
  users: [],
  usersPagination: null,
  usersLoading: false,

  // Orders
  orders: [],
  ordersPagination: null,
  ordersLoading: false,

  // Coupons
  coupons: [],
  couponsPagination: null,
  couponsLoading: false,

  // UI State
  loading: false,
  error: null,
  success: null,
}

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboardLoading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false
        state.dashboardStats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false
        state.error = action.payload
      })

      // Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false
        state.users = action.payload.users
        state.usersPagination = action.payload.pagination
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.error = action.payload
      })

      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.user
        const index = state.users.findIndex((user) => user._id === updatedUser._id)
        if (index !== -1) {
          state.users[index] = updatedUser
        }
        state.success = action.payload.message
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload)
        state.success = "User deleted successfully"
      })

      // Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.ordersLoading = true
        state.error = null
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.ordersLoading = false
        state.orders = action.payload.orders
        state.ordersPagination = action.payload.pagination
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.ordersLoading = false
        state.error = action.payload
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order
        const index = state.orders.findIndex((order) => order._id === updatedOrder._id)
        if (index !== -1) {
          state.orders[index] = updatedOrder
        }
        state.success = action.payload.message
      })

      // Coupons
      .addCase(fetchAllCoupons.pending, (state) => {
        state.couponsLoading = true
        state.error = null
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.couponsLoading = false
        state.coupons = action.payload.coupons
        state.couponsPagination = action.payload.pagination
      })
      .addCase(fetchAllCoupons.rejected, (state, action) => {
        state.couponsLoading = false
        state.error = action.payload
      })

      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload.coupon)
        state.success = action.payload.message
      })

      .addCase(updateCoupon.fulfilled, (state, action) => {
        const updatedCoupon = action.payload.coupon
        const index = state.coupons.findIndex((coupon) => coupon._id === updatedCoupon._id)
        if (index !== -1) {
          state.coupons[index] = updatedCoupon
        }
        state.success = action.payload.message
      })

      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((coupon) => coupon._id !== action.payload)
        state.success = "Coupon deleted successfully"
      })
  },
})

export const { clearError, clearSuccess, setLoading } = adminSlice.actions
export default adminSlice.reducer
