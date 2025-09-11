import axios from "axios";

// Get API base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ksaunibliss.com/api';

// Create axios instance for admin API
const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin API methods to match adminSlice expectations
const adminAPIFunctions = {
  // Dashboard
  getDashboardStats: () => adminAPI.get('/dashboard/stats'),
  
  // Users
  getAllUsers: (params) => adminAPI.get('/users', { params }),
  updateUserRole: (userId, data) => adminAPI.patch(`/users/${userId}/role`, data),
  deleteUser: (userId) => adminAPI.delete(`/users/${userId}`),
  
  // Orders
  getAllOrders: (params) => adminAPI.get('/orders', { params }),
  updateOrderStatus: (orderId, data) => adminAPI.patch(`/orders/${orderId}/status`, data),
  
  // Coupons
  getAllCoupons: (params) => adminAPI.get('/coupons', { params }),
  createCoupon: (data) => adminAPI.post('/coupons', data),
  updateCoupon: (couponId, data) => adminAPI.put(`/coupons/${couponId}`, data),
  deleteCoupon: (couponId) => adminAPI.delete(`/coupons/${couponId}`),
  
  // Auth
  loginAdmin: (credentials) => adminAPI.post('/auth/login', credentials),
  verifyAdminToken: () => adminAPI.get('/auth/verify'),
};

// Export the functions directly to match slice imports
export default adminAPIFunctions;