const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getTrendingProducts,
  getNewArrivals,
  getSearchedProducts,
  getProductsByCategory,
} = require("../controllers/productController");

// ===============================
// Product Routes
// ===============================

// GET all products with filters
router.get("/", getProducts);

// GET searched products
router.get("/search", getSearchedProducts);

// GET trending products
router.get("/trending", getTrendingProducts);

// GET new arrivals
router.get("/new", getNewArrivals);

// GET products by category
router.get("/category/:categoryId", getProductsByCategory);

// GET single product by ID
router.get("/:id", getProduct);

// POST create product (Admin only)
// TODO: add auth and admin middleware when integrating
router.post("/", createProduct);

// PUT update product (Admin only)
// TODO: add auth and admin middleware when integrating
router.put("/:id", updateProduct);

// DELETE product (Admin only)
// TODO: add auth and admin middleware when integrating
router.delete("/:id", deleteProduct);

// POST add product review (Requires auth)
// TODO: add auth middleware when integrating
router.post("/:id/review", addReview);

module.exports = router;
