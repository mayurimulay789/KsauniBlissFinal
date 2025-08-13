import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Axios instance with token interceptor
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fashionhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const bannerAPI = {
  getAllBanners: (params) => api.get("/banners", { params }), // can pass type, isActive as query params
  getHeroBanners: () => api.get("/banners/hero"),
  getPromoBanners: () => api.get("/banners/promo"),
  createBanner: (bannerData) =>
    api.post("/banners", bannerData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateBanner: (id, bannerData) =>
    api.put(`/banners/${id}`, bannerData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
};

export { bannerAPI };
