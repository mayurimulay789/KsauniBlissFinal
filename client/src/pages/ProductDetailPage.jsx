"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation, Thumbs } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/navigation"
import "swiper/css/thumbs"
import { Heart, Minus, Plus, X, AlertCircle, Ruler, ShoppingCart, Lock } from "lucide-react"

import { fetchProductById } from "../store/slices/productSlice"
import { addToCart, optimisticAddToCart, selectIsAddingToCart } from "../store/slices/cartSlice"
import {
  addToWishlist,
  removeFromWishlist,
  optimisticAddToWishlist,
  optimisticRemoveFromWishlist,
  selectIsAddingToWishlist,
  selectIsRemovingFromWishlist,
} from "../store/slices/wishlistSlice"

import ProductReviews from "../components/ProductReviews"
import RelatedProducts from "../components/RelatedProducts"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const ProductDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()

  const { currentProduct, isLoading, error } = useSelector((state) => state.products)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const isAddingToCart = useSelector(selectIsAddingToCart)
  const isAddingToWishlist = useSelector(selectIsAddingToWishlist)
  const isRemovingFromWishlist = useSelector(selectIsRemovingFromWishlist)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)

  const isInWishlist = wishlistItems.some((item) => item._id === currentProduct?._id)

  useEffect(() => {
    if (id) dispatch(fetchProductById(id))
  }, [dispatch, id])

  useEffect(() => {
    if (currentProduct) {
      if (currentProduct.sizes?.length > 0) setSelectedSize(currentProduct.sizes[0].size)
      if (currentProduct.colors?.length > 0) setSelectedColor(currentProduct.colors[0].name)
    }
  }, [currentProduct])

  const getDiscountPercentage = () => {
    if (currentProduct?.originalPrice && currentProduct.originalPrice > currentProduct.price) {
      return Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
    }
    return 0
  }

  const getSelectedSizeStock = () => {
    if (!selectedSize || !currentProduct?.sizes) return currentProduct?.stock || 0
    const sizeData = currentProduct.sizes.find((s) => s.size === selectedSize)
    return sizeData?.stock || 0
  }

  const handleAddToCart = async () => {
    if (currentProduct.sizes?.length && !selectedSize) return toast.error("Please select a size")
    if (currentProduct.colors?.length && !selectedColor) return toast.error("Please select a color")

    const payload = { productId: currentProduct._id, quantity, size: selectedSize, color: selectedColor }
    dispatch(optimisticAddToCart({ product: currentProduct, quantity, size: selectedSize, color: selectedColor }))
    toast.success(`${currentProduct.name} added to cart!`)

    const bag = document.querySelector("#bag")
    if (bag) {
      bag.style.transform = "scale(1.2)"
      setTimeout(() => (bag.style.transform = "scale(1)"), 200)
    }

    try {
      await dispatch(addToCart(payload)).unwrap()
    } catch (err) {
      console.error(err)
      toast.error(err?.message || "Failed to add to cart")
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    // You can add navigation to checkout page here if needed
  }

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist) {
        dispatch(optimisticRemoveFromWishlist(currentProduct._id))
        toast.success(`${currentProduct.name} removed from wishlist!`)
        await dispatch(removeFromWishlist(currentProduct._id)).unwrap()
      } else {
        dispatch(optimisticAddToWishlist(currentProduct))
        toast.success(`${currentProduct.name} added to wishlist!`)
        await dispatch(addToWishlist(currentProduct)).unwrap()
      }
      const wish = document.querySelector("#wish")
      if (wish) {
        wish.style.transform = "scale(1.2)"
        setTimeout(() => (wish.style.transform = "scale(1)"), 200)
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.message || "Failed to update wishlist")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct.name,
          text: currentProduct.description,
          url: window.location.href,
        })
      } catch {
        // User cancelled sharing
        toast.error("Failed to share product")
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied")
      } catch {
        toast.error("Failed to copy")
      }
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading product…" />
  if (error || !currentProduct)
    return (
      <div className="container py-16 mx-auto text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h1 className="mb-2 text-2xl font-bold">Product Not Found</h1>
        <p className="mb-8 text-gray-600">It may have been removed.</p>
        <Link
          to="/products"
          className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-primary-dark"
        >
          Browse Products
        </Link>
      </div>
    )

  return (
    <div className="min-h-screen pb-20 bg-gray-50 sm:pb-0">
      {/* Desktop Breadcrumb - Hidden on mobile */}
      <div className="hidden py-1 bg-white shadow-sm sm:block">
        <div className="container px-4 mx-auto sm:px-6">
          <nav className="flex items-center space-x-2 overflow-x-auto text-sm text-gray-600 whitespace-nowrap">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <Link to={`/products/${currentProduct.category?.slug}`} className="hover:text-primary">
              {currentProduct.category?.name}
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-800">{currentProduct.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-2 mx-auto sm:px-6">
        <div className="overflow-hidden bg-white shadow-md rounded-xl">
          <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2">
            {/* Images Section */}
            <div className="relative space-y-4">
              {/* Wishlist Button - Top right corner of image */}
              <button
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist || isRemovingFromWishlist}
                className={`absolute top-5 right-2 z-10 p-2 rounded-full transition-colors ${
                  isInWishlist
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-gray-400 hover:text-primary hover:bg-primary/10"
                }`}
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart id="wish" className={`w-6 h-6 ${isInWishlist ? "fill-current" : ""}`} />
              </button>

              {/* Mobile Category Label - Bottom left corner of image */}
              {/* <div className="absolute z-10 px-2 py-1 text-xs text-white rounded lg:hidden bottom-2 left-2 bg-black/70">
                {currentProduct.category?.name}
              </div> */}

              {/* Mobile Swiper */}
              <div className="lg:hidden">
                <Swiper
                  spaceBetween={10}
                  // Remove navigation arrows on mobile swiper
                  // navigation
                  thumbs={{ swiper: thumbsSwiper }}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="rounded-lg"
                >
                  {currentProduct.images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square">
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={currentProduct.name}
                          className="object-contain w-full h-full cursor-zoom-in"
                          loading="lazy"
                          onClick={() => {
                            setSelectedImage(idx)
                            setShowImageModal(true)
                          }}
                        />
                        {getDiscountPercentage() > 0 && (
                          <div className="absolute px-2 py-1 text-xs font-bold text-red-900 bg-white rounded-full top-3 left-3">
                            {getDiscountPercentage()}% OFF
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={8}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="mt-2"
                >
                  {currentProduct.images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="overflow-hidden bg-gray-100 border-2 border-transparent rounded-md cursor-pointer aspect-square hover:border-primary">
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`${currentProduct.name} ${idx + 1}`}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Desktop Image Display */}
              <div className="hidden lg:block">
                <div className="relative overflow-hidden bg-gray-50 rounded-xl group">
                  <motion.img
                    src={currentProduct.images[selectedImage]?.url}
                    alt={currentProduct.name}
                    className="object-contain max-w-full max-h-full cursor-zoom-in"
                    onClick={() => setShowImageModal(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    loading="lazy"
                  />
                  {/*
                  {currentProduct.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setSelectedImage(prev => (prev - 1 + currentProduct.images.length) % currentProduct.images.length)} 
                        className="absolute p-2 transition-opacity bg-white rounded-full shadow-md opacity-0 left-4 top-1/2 group-hover:opacity-100 hover:bg-gray-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setSelectedImage(prev => (prev + 1) % currentProduct.images.length)} 
                        className="absolute p-2 transition-opacity bg-white rounded-full shadow-md opacity-0 right-4 top-1/2 group-hover:opacity-100 hover:bg-gray-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  */}

                  {getSelectedSizeStock() === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <span className="px-4 py-2 font-medium text-gray-800 bg-white rounded-full">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {currentProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square bg-gray-100 rounded-md overflow-hidden border-2 transition ${
                        selectedImage === idx ? "border-primary" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img.url || "/placeholder.svg"}
                        alt={`${currentProduct.name} ${idx + 1}`}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Name Under Product Image */}
              <div className="mt-4 text-left lg:hidden">
                <p className="text-xl font-bold text-gray-900">
                  <span>{currentProduct.brand || "Ksauni Bliss"}</span>
                </p>
                {currentProduct.description && (
                  <p className="mt-1 text-sm text-gray-600">{currentProduct.description}</p>
                )}
                {/* Price under description */}
                <div className="mt-3">
                  <span className="text-2xl font-bold text-gray-900">₹{currentProduct.price.toLocaleString()}</span>
                  {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      ₹{currentProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {getDiscountPercentage() > 0 && (
                    <span className="ml-2 text-sm font-medium text-green-600">{getDiscountPercentage()}% OFF</span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || getSelectedSizeStock() === 0}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-semibold text-gray-800 transition-colors bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    ADD TO CART
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isAddingToCart || getSelectedSizeStock() === 0}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    BUY NOW
                  </button>
                </div>
              </div>

              {/* Share Button */}
              {/* <button 
                onClick={handleShare}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-4 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share this product</span>
              </button> */}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="hidden mb-6 lg:block">
                    <p className="mb-2 text-2xl font-bold text-gray-900">
                      <span>{currentProduct.brand || "Ksauni Bliss"}</span>
                    </p>
                    {currentProduct.description && (
                      <p className="mb-4 text-base text-gray-600">{currentProduct.description}</p>
                    )}
                    {/* Price section */}
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">₹{currentProduct.price.toLocaleString()}</span>
                      {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                        <span className="ml-3 text-xl text-gray-500 line-through">
                          ₹{currentProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                      {getDiscountPercentage() > 0 && (
                        <span className="ml-3 text-base font-medium text-green-600">
                          {getDiscountPercentage()}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex max-w-md gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || getSelectedSizeStock() === 0}
                        className="flex items-center justify-center flex-1 gap-2 px-8 py-2 font-semibold text-gray-800 transition-colors bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        ADD TO CART
                      </button>
                      <button
                        onClick={handleBuyNow}
                        disabled={isAddingToCart || getSelectedSizeStock() === 0}
                        className="flex items-center justify-center flex-1 gap-2 px-8 py-2 font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-5 h-5" />
                        BUY NOW
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors */}
              {currentProduct.colors?.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">
                    Color: <span className="font-normal">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.colors.map((color) => (
                      <motion.button
                        key={color.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          selectedColor === color.name
                            ? "border-primary shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        title={color.name}
                        aria-label={`Select color ${color.name}`}
                      >
                        <div
                          className="w-8 h-8 border border-gray-200 rounded-full"
                          style={{ backgroundColor: color.hex || color.name.toLowerCase() }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {currentProduct.sizes?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Size: <span className="font-normal">{selectedSize}</span>
                    </h3>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      <Ruler className="w-4 h-4 mr-1" />
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 p-3 border border-gray-200 sm:grid-cols-5 rounded-xl">
                    {currentProduct.sizes.map((s) => (
                      <motion.button
                        key={s.size}
                        onClick={() => setSelectedSize(s.size)}
                        disabled={s.stock === 0}
                        className={`px-3 py-2 rounded-lg border font-medium text-sm ${
                          selectedSize === s.size
                            ? "border-primary bg-primary/10 text-primary"
                            : s.stock === 0
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {s.size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center overflow-hidden border border-gray-300 rounded-lg">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="px-4 py-2 font-medium border-gray-300 border-x">{quantity}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.min(getSelectedSizeStock(), quantity + 1))}
                      disabled={quantity >= getSelectedSizeStock()}
                      className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {getSelectedSizeStock()} available{selectedSize && ` in ${selectedSize}`}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Static Design Section */}
          <StaticDesignSection />

          {/* Reviews Section */}
          <div id="reviews" className="px-6 py-8 border-t border-gray-200 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <ProductReviews productId={currentProduct._id} />
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          {/* <h2 className="mb-6 text-2xl font-bold text-gray-900">You may also like</h2> */}
          <RelatedProducts currentProduct={currentProduct} />
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              className="relative max-w-4xl w-full max-h-[90vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute right-0 p-2 text-white -top-12 hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center justify-center h-full">
                <img
                  src={currentProduct.images[selectedImage]?.url || "/placeholder.svg"}
                  alt={currentProduct.name}
                  className="object-contain max-w-full max-h-full"
                  loading="lazy"
                />
              </div>
              {/*
              {currentProduct.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImage(prev => (prev - 1 + currentProduct.images.length) % currentProduct.images.length)} 
                    className="absolute left-0 p-3 text-white top-1/2 hover:text-gray-300"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={() => setSelectedImage(prev => (prev + 1) % currentProduct.images.length)} 
                    className="absolute right-0 p-3 text-white top-1/2 hover:text-gray-300"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
              */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              className="relative bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Size Guide</h3>
                  <button onClick={() => setShowSizeGuide(false)} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="prose-sm prose max-w-none">
                  <p className="mb-4 text-gray-600">
                    Use this guide to help determine your correct size. Measurements are in inches.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase border-b">
                            Size
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase border-b">
                            Chest
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase border-b">
                            Waist
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase border-b">
                            Hip
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border-b border-gray-200">S</td>
                          <td className="px-4 py-2 border-b border-gray-200">34-36</td>
                          <td className="px-4 py-2 border-b border-gray-200">28-30</td>
                          <td className="px-4 py-2 border-b border-gray-200">36-38</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border-b border-gray-200">M</td>
                          <td className="px-4 py-2 border-b border-gray-200">38-40</td>
                          <td className="px-4 py-2 border-b border-gray-200">32-34</td>
                          <td className="px-4 py-2 border-b border-gray-200">40-42</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border-b border-gray-200">L</td>
                          <td className="px-4 py-2 border-b border-gray-200">42-44</td>
                          <td className="px-4 py-2 border-b border-gray-200">36-38</td>
                          <td className="px-4 py-2 border-b border-gray-200">44-46</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border-b border-gray-200">XL</td>
                          <td className="px-4 py-2 border-b border-gray-200">46-48</td>
                          <td className="px-4 py-2 border-b border-gray-200">40-42</td>
                          <td className="px-4 py-2 border-b border-gray-200">48-50</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">XXL</td>
                          <td className="px-4 py-2">50-52</td>
                          <td className="px-4 py-2">44-46</td>
                          <td className="px-4 py-2">52-54</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 mt-6 rounded-lg bg-blue-50">
                    <h4 className="mb-2 font-medium text-blue-800">How to measure</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Chest: Measure around the fullest part of your chest</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Waist: Measure around your natural waistline</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Hip: Measure around the fullest part of your hips</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const StaticDesignSection = () => {
  return (
    <div className="px-4 py-6 mt-8 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl sm:px-8">
      <div className="flex flex-row flex-wrap items-center justify-between max-w-4xl gap-6 mx-auto">
        {/* Genuine Products */}
        <div className="flex flex-col items-center flex-1 space-y-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="22" stroke="#EF4444" strokeWidth="3" />
            <path
              fill="#EF4444"
              d="M24 12l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2 5-10z"
            />
            <text
              x="24"
              y="30"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="white"
              fontFamily="Arial, sans-serif"
            >
              ORIGINAL
            </text>
          </svg>
          <span className="text-sm font-semibold text-gray-700">Genuine Products</span>
        </div>

        {/* 7 Step Quality Check */}
        <div className="flex flex-col items-center flex-1 space-y-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="22" stroke="#EF4444" strokeWidth="3" />
            <path
              fill="#EF4444"
              d="M16 24l6 6 12-12-3-3-9 9-3-3-3 3z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-700">7 Step Quality Check</span>
        </div>

        {/* Secure Payments */}
        <div className="flex flex-col items-center flex-1 space-y-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#EF4444"
              d="M24 4c-7 0-12 4-12 10v10c0 6 5 14 12 14s12-8 12-14V14c0-6-5-10-12-10z"
              stroke="#EF4444"
              strokeWidth="3"
            />
            <text
              x="24"
              y="30"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#EF4444"
              fontFamily="Arial, sans-serif"
            >
              ₹
            </text>
          </svg>
          <span className="text-sm font-semibold text-gray-700">Secure Payments</span>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage