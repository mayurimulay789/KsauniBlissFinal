"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X } from "lucide-react"
import toast from "react-hot-toast"

// Redux actions
import { fetchProducts, setFilters, clearFilters } from "../store/slices/productSlice"
import { fetchCategories } from "../store/slices/categorySlice"
import { addToCart, optimisticAddToCart } from "../store/slices/cartSlice"
import { optimisticAddToWishlist, optimisticRemoveFromWishlist } from "../store/slices/wishlistSlice"

// Components
import ProductFilters from "../components/ProductFilter"
import LoadingSpinner from "../components/LoadingSpinner"
import CategoryBanner from "../components/CategoryBanner"
import ProductCard from "../components/ProductCard"

// Selectors
const selectProducts = (state) => state.products
const selectCategories = (state) => state.categories
const selectAuth = (state) => state.auth
const selectWishlist = (state) => state.wishlist

const ProductsPage = () => {
  const { category: categorySlug } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  // Selectors
  const { products, isLoading, error, filters } = useSelector(selectProducts)
  const { categories } = useSelector(selectCategories)
  const { user } = useSelector(selectAuth)
  const { items: wishlistItems } = useSelector(selectWishlist)

  // Memoized values
  const activeFiltersCount = useMemo(
    () =>
      Object.entries(filters).reduce((count, [key, value]) => {
        if (Array.isArray(value) ? value.length > 0 : Boolean(value)) {
          return count + 1
        }
        return count
      }, 0),
    [filters],
  )

  const getFiltersFromURL = useCallback(() => {
    const urlFilters = {
      category: searchParams.get("category") || "",
      search: searchParams.get("search") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minRating: searchParams.get("minRating") || "",
    }
    console.log("[v0] URL search params:", Object.fromEntries(searchParams.entries()))
    console.log("[v0] Extracted filters from URL:", urlFilters)
    return urlFilters
  }, [searchParams])

  // Fetch categories once
  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const urlFilters = getFiltersFromURL()
    console.log("[v0] Setting filters from URL:", urlFilters)
    dispatch(setFilters(urlFilters))
  }, [getFiltersFromURL, dispatch])

  // Fetch products when filters change
  useEffect(() => {
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) acc[key] = value
      } else if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {})

    console.log("[v0] Current filters state:", filters)
    console.log("[v0] Clean filters for API:", cleanFilters)
    dispatch(fetchProducts({ ...cleanFilters, limit: 100 }))
  }, [dispatch, filters, searchParams])

  const handleAddToCart = useCallback(
    async (product, e) => {
      e.preventDefault()
      e.stopPropagation()

      // if (!user) {
      //   navigate("/login", { state: { from: window.location.pathname } })
      //   toast.error("Please login to add items to cart")
      //   return
      // }

      // ✅ must send productId, not product
      const cartItem = {
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0]?.size || "",
        color: product.colors?.[0]?.name || "",
      }

      // Optimistic UI update
      dispatch(
        optimisticAddToCart({
          product,
          quantity: 1,
          size: cartItem.size,
          color: cartItem.color,
        }),
      )

      try {
        await dispatch(addToCart(cartItem)).unwrap()
        toast.success(`${product.name} added to cart!`)
      } catch (error) {
        toast.error("Failed to add item to cart. Please try again.")
        console.error("Add to cart error:", error)
      }
    },
    [dispatch, navigate, user],
  )

  const handleWishlist = useCallback(
    async (product, e) => {
      e.preventDefault()
      e.stopPropagation()

      if (!user) {
        navigate("/login", { state: { from: window.location.pathname } })
        toast.error("Please login to manage your wishlist")
        return
      }

      const isInWishlist = wishlistItems.some((item) => item._id === product._id)

      if (isInWishlist) {
        dispatch(optimisticRemoveFromWishlist(product._id))
        toast.success(`${product.name} removed from wishlist!`)
      } else {
        dispatch(optimisticAddToWishlist(product))
        toast.success(`${product.name} added to wishlist!`)
      }
    },
    [dispatch, navigate, user, wishlistItems],
  )

  const handleFilterChange = useCallback(
    (newFilters) => {
      dispatch(setFilters({ ...filters, ...newFilters }))
    },
    [dispatch, filters],
  )

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-4 pt-8 mx-auto md:pt-10">
        {/* Category Banner */}
        <div className="w-full mb-6 rounded-lg ">
          <CategoryBanner />
        </div>

        {/* Sticky Filter Header */}
        <div className="sticky top-0 z-30 pt-4 bg-gray-50">
          <div className="flex flex-col justify-between mb-4 md:flex-row md:items-center">
            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-ksauni-red hover:bg-ksauni-dark-red"
                aria-label="Open filters"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-ksauni-dark-red">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 py-2 mb-4 bg-gray-50">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 text-xs rounded-full text-ksauni-dark-red bg-ksauni-red/10">
                  Category: {categories.find((cat) => cat._id === filters.category)?.name || filters.category}
                  <button
                    onClick={() => handleFilterChange({ category: "" })}
                    className="ml-1 hover:text-ksauni-dark-red"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 text-xs rounded-full text-ksauni-dark-red bg-ksauni-red/10">
                  Search: {filters.search}
                  <button
                    onClick={() => handleFilterChange({ search: "" })}
                    className="ml-1 hover:text-ksauni-dark-red"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center px-2 py-1 text-xs rounded-full text-ksauni-dark-red bg-ksauni-red/10">
                  Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || "∞"}
                  <button
                    onClick={() => handleFilterChange({ minPrice: "", maxPrice: "" })}
                    className="ml-1 hover:text-ksauni-dark-red"
                    aria-label="Remove price filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.minRating && (
                <span className="inline-flex items-center px-2 py-1 text-xs rounded-full text-ksauni-dark-red bg-ksauni-red/10">
                  Rating: {filters.minRating}+ Stars
                  <button
                    onClick={() => handleFilterChange({ minRating: "" })}
                    className="ml-1 hover:text-ksauni-dark-red"
                    aria-label="Remove rating filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-ksauni-red hover:text-ksauni-dark-red md:text-sm"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block md:w-56 lg:w-64 sticky top-[180px] h-[calc(100vh-180px)] overflow-y-auto">
            <ProductFilters
              key={categorySlug || "all"}
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
            />
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-6 rounded-lg bg-red-50">
                  <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Products</h3>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 mt-3 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-6 bg-gray-100 rounded-lg">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">No Products Found</h3>
                  <p className="text-sm text-gray-600">Try adjusting your filters or search criteria.</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1.5 mt-3 text-sm text-white bg-ksauni-red rounded-lg hover:bg-ksauni-dark-red"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                <AnimatePresence>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      wishlistItems={wishlistItems}
                      user={user}
                      onAddToCart={handleAddToCart}
                      onWishlist={handleWishlist}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 md:hidden"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md max-h-[90vh] mx-4 bg-white rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
                <ProductFilters
                  key={categorySlug || "all"}
                  filters={filters}
                  categories={categories}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearAllFilters}
                />
              </div>

              <div className="sticky bottom-0 z-10 flex justify-between p-4 bg-white border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-medium text-ksauni-red hover:text-ksauni-dark-red"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-ksauni-red hover:bg-ksauni-dark-red"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductsPage
