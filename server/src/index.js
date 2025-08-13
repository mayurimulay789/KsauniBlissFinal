const dotenv = require("dotenv")
const path = require("path")
// Load environment variables first
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()

// Middleware to set default cache-control header
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
  next()
})

// Debug environment variables
console.log("🔧 Environment Check:")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("PORT:", process.env.PORT)
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Missing")
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing")

// Middleware
// Parse CORS_ORIGIN from environment variables
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins, // Dynamically set origins from .env
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Health check endpoint (should be before other routes)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FashionHub API Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
})

// Routes
app.use("/api/auth", require("../routes/auth"))
app.use("/api/products", require("../routes/product"))
app.use("/api/categories", require("../routes/categories")) // Corrected from categories to category based on previous block
app.use("/api/cart", require("../routes/cart"))
app.use("/api/orders", require("../routes/order"))
app.use("/api/reviews", require("../routes/review"))
app.use("/api/wishlist", require("../routes/wishlist"))
app.use("/api/coupons", require("../routes/coupon"))
app.use("/api/banners", require("../routes/banner"))
app.use("/api/innovations", require("../routes/innovation"))
app.use("/api/returns", require("../routes/return"))
app.use("/api/admin", require("../routes/admin"))
app.use("/api/digital-marketer", require("../routes/digitalMarketer"))
app.use("/api/shiprocket", require("../routes/shiprocket"))
app.use("/api/popup-setting", require("../routes/popupSetting"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err,
    }),
  })
})

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/fashionhub"
    console.log("🔄 Connecting to MongoDB...")
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ Connected to MongoDB")
    console.log("📊 Database:", mongoose.connection.name)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  }
}

// Connect to database
connectDB()

// Start server
const PORT = process.env.PORT || 5000 // Changed back to 5000 to match frontend
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully")
  mongoose.connection.close(() => {
    console.log("📊 MongoDB connection closed")
    process.exit(0)
  })
})
