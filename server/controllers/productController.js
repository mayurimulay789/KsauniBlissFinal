const Product = require("../models/Product");
const Category = require("../models/Category");
const { uploadToCloudinary } = require("../utils/cloudinary");
const mongoose = require("mongoose");

// Helper to parse JSON fields safely
const parseJson = (data, fallback) => {
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

// Get all products with filters
// Get all products with filters
const getProducts = async (req, res) => {
  try {
    const {
      category,
      tag,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      search,
      sizes,
      colors,
      rating,
    } = req.query;

    const query = { isActive: true };

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category }) || await Category.findOne({ name: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          return res.status(200).json({
            success: true,
            products: [],
            pagination: { current: Number(page), pages: 0, total: 0 },
          });
        }
      }
    }

    if (tag) query.tags = { $in: [tag] };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (sizes) {
      const arr = Array.isArray(sizes) ? sizes : [sizes];
      query["sizes.size"] = { $in: arr };
    }
    if (colors) {
      const arr = Array.isArray(colors) ? colors : [colors];
      query["colors.name"] = { $in: arr };
    }
    if (rating) {
      query["rating.average"] = { $gte: Number(rating) };
    }

    const sortOptions = {
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      rating: { "rating.average": -1 },
      newest: { createdAt: -1 },
    };
    const sortOption = sortOptions[sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};



// Get trending products
const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      tags: { $in: ["trending"] },
    })
      .populate("category", "name slug")
      .sort({ "rating.average": -1, createdAt: -1 })
      .limit(12);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get trending products error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trending products" });
  }
};

// Get new arrivals
const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      tags: { $in: ["new-arrival"] },
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(12);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get new arrivals error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch new arrivals" });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("reviews.user", "name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, originalPrice, category, subcategory,
      sizes, colors, tags, stock, weight, dimensions,
    } = req.body;

    const images = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products");
        images.push({ url: result.secure_url, alt: name });
      }
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      images,
      category,
      subcategory,
      sizes: parseJson(sizes, []),
      colors: parseJson(colors, []),
      tags: parseJson(tags, []),
      stock: Number(stock) || 0,
      weight: weight ? Number(weight) : undefined,
      dimensions: parseJson(dimensions, undefined),
    });

    await product.save();
    await Category.findByIdAndUpdate(category, { $inc: { productCount: 1 } });

    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, message: "Failed to create product" });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (req.files && req.files.length) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "products");
        newImages.push({ url: result.secure_url, alt: updateData.name || product.name });
      }
      updateData.images = [...product.images, ...newImages];
    }

    updateData.sizes = parseJson(updateData.sizes, product.sizes);
    updateData.colors = parseJson(updateData.colors, product.colors);
    updateData.tags = parseJson(updateData.tags, product.tags);
    updateData.dimensions = parseJson(updateData.dimensions, product.dimensions);

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("category", "name slug");

    res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

// Add product review
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const existingReview = product.reviews.find(r => r.user.toString() === userId);
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product" });
    }

    const reviewImages = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "reviews");
        reviewImages.push(result.secure_url);
      }
    }

    product.reviews.push({
      user: userId,
      rating: Number(rating),
      comment,
      images: reviewImages,
    });

    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = {
      average: totalRating / product.reviews.length,
      count: product.reviews.length,
    };

    await product.save();

    res.status(201).json({ success: true, message: "Review added successfully", product });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ success: false, message: "Failed to add review" });
  }
};
const getSearchedProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query string is required" });

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).populate("category", "name slug");

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({ success: false, message: "Failed to search products" });
  }
};
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      sort,
      page = 1,
      limit = 12,
      sizes,
      colors,
      minPrice,
      maxPrice,
      rating,
    } = req.query;

    const query = { category: categoryId, isActive: true };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (sizes) {
      const arr = Array.isArray(sizes) ? sizes : [sizes];
      query["sizes.size"] = { $in: arr };
    }
    if (colors) {
      const arr = Array.isArray(colors) ? colors : [colors];
      query["colors.name"] = { $in: arr };
    }
    if (rating) {
      query["rating.average"] = { $gte: Number(rating) };
    }

    const sortOptions = {
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      rating: { "rating.average": -1 },
      newest: { createdAt: -1 },
    };
    const sortOption = sortOptions[sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch category products" });
  }
};

module.exports = {
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
};
