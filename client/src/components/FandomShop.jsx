"use client"

import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { fetchNewArrivals } from "../store/slices/productSlice"

const ShopByFandom = () => {
  const dispatch = useDispatch()
  const { newArrivals, isLoadingNewArrivals } = useSelector((state) => state.products)

  // Fetch new arrivals on component mount
  useEffect(() => {
    dispatch(fetchNewArrivals())
  }, [dispatch])

  // Take first 3 products for display
  const productsToShow = newArrivals.slice(0, 3)

  if (isLoadingNewArrivals) {
    return (
      <section className="py-4 bg-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-4 text-center">
            <h2 className="text-xl italic font-black text-black sm:text-2xl md:text-3xl">
              SHOP BY <span className="text-red-600">FANDOM</span>
            </h2>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">Style for Every Mood, Every Day</p>
          </div>
          <div className="flex justify-center gap-2 overflow-x-auto sm:gap-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-32 bg-gray-200 rounded-lg sm:w-40 md:w-48 lg:w-56 animate-pulse"
              >
                <div className="w-full h-32 bg-gray-300 rounded-lg sm:h-40 md:h-48 lg:h-56"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!newArrivals.length) {
    return (
      <section className="py-4 bg-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-4 text-center">
            <h2 className="text-xl italic font-black text-black sm:text-2xl md:text-3xl">
              SHOP BY <span className="text-red-600">FANDOM</span>
            </h2>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">Style for Every Mood, Every Day</p>
          </div>
          <div className="py-8 text-center text-gray-500">
            <p>No products available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-4 bg-white sm:py-6">
      <div className="px-4 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-4 text-center sm:mb-6"
        >
          <h2 className="text-xl italic font-black text-black sm:text-2xl md:text-3xl">
            SHOP BY <span className="text-red-600">FANDOM</span>
          </h2>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">Style for Every Mood, Every Day</p>
        </motion.div>

        <div className="flex justify-center gap-2 pb-2 overflow-x-auto sm:gap-4 md:gap-6">
          {productsToShow.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex-shrink-0 cursor-pointer group"
            >
              <Link to={`/product/${product._id}`}>
                <div className="relative overflow-hidden transition-all duration-300 rounded-lg shadow-md hover:shadow-lg group-hover:scale-105">
                  <img
                    src={product.images?.[0]?.url || "/placeholder.svg?height=200&width=200&query=anime t-shirt"}
                    alt={product.name}
                    className="object-cover w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=200&width=200"
                    }}
                  />
                  {/* Optional: Price overlay on hover */}
                  <div className="absolute inset-0 flex items-end justify-center transition-all duration-300 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-30 group-hover:opacity-100">
                    <div className="mb-2 text-sm font-bold text-white">₹{product.price}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShopByFandom
