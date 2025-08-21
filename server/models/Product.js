const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: String,
    },
    sizes: [
      {
        size: String,
        stock: {
          type: Number,
          default: 0,
        },
      },
    ],
    colors: [
      {
        name: String,
        code: String,
        images: [String],
      },
    ],
    tags: [
      {
        type: String,
        enum: ["trending", "new-arrival", "sale", "featured"],
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        images: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    productDetails: {
      type: String,
      default: "",
    },
    material: {
      type: String,
      default: "",
    },
    fits: {
      type: String,
      enum: ["regular", "slim", "oversized", "loose", "fitted", "crop"],
      default: "regular",
    },
    modelSizeFit: {
      modelHeight: String,
      modelChest: String,
      modelWaist: String,
      modelHips: String,
      modelSizeWorn: String,
      fitType: {
        type: String,
        enum: ["regular", "slim", "oversized", "loose", "fitted"],
        default: "regular",
      },
    },
    materialCare: {
      material: [String],
      careInstructions: [String],
      features: [String],
    },
  },
  {
    timestamps: true,
  },
)

// Generate SKU before saving
productSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = "FH" + Date.now() + Math.floor(Math.random() * 1000)
  }
  next()
})

module.exports = mongoose.model("Product", productSchema)
