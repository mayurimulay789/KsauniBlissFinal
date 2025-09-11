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
  
  // Innovations
  getAllInnovations: () => adminAPI.get('/innovations'),
  createInnovation: (data) => adminAPI.post('/innovations', data),
  updateInnovation: (innovationId, data) => adminAPI.put(`/innovations/${innovationId}`, data),
  deleteInnovation: (innovationId) => adminAPI.delete(`/innovations/${innovationId}`),
  
  // Products
  getAllProducts: (params) => adminAPI.get('/products', { params }),
  createProduct: (data) => adminAPI.post('/products', data),
  updateProduct: (productId, data) => adminAPI.put(`/products/${productId}`, data),
  deleteProduct: (productId) => adminAPI.delete(`/products/${productId}`),
  
  // Categories
  getAllCategories: (params) => adminAPI.get('/categories', { params }),
  
  // Top 10 Products
  getAllTop10Products: () => adminAPI.get('/top10'),
  createTop10Product: (data) => adminAPI.post('/top10', data),
  updateTop10Product: (id, data) => adminAPI.put(`/top10/${id}`, data),
  deleteTop10Product: (id) => adminAPI.delete(`/top10/${id}`),
};

// Export the functions directly to match slice imports
export default adminAPIFunctions;