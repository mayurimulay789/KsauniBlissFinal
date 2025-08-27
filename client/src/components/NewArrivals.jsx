"use client"

import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function NewArrivals() {
  const dispatch = useDispatch()
  const { newArrivals } = useSelector((state) => state.products) || { newArrivals: [] }
  const [productsToShow, setProductsToShow] = useState([])

  useEffect(() => {
    const filteredProducts = newArrivals.filter((product) => product.price >= 349)
    setProductsToShow(filteredProducts.slice(0, 12))
  }, [newArrivals])

  if (!productsToShow || productsToShow.length === 0) {
    return null
  }

  return (
    <section className="bg-white ml-2 sm:ml-4">
      <div className="px-1">
        {/* Heading */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[18px] font-bold text-black mb-2">New Arrivals From Rs. 599</h2>
          <Link to="/products" className="text-black text-[18px] font-bold leading-none">
            +
          </Link>
        </div>

        {/* Products Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-3 px-3">
          {productsToShow.map((product, index) => {
            const discountPercentage =
              product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0

            return (
              <div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="
                  flex-shrink-0 
                  border border-gray-500/80  hover:border-gray-800/80 transition-colors duration-200
                  rounded-[5px] bg-white overflow-hidden shadow-sm
                  w-[calc(40%-4px)]  
                  min-[480px]:w-[calc(33.333%-5.33px)]
                  sm:w-[calc(25%-6px)] 
                  md:w-[calc(20%-6.4px)] 
                  lg:w-[calc(16.666%-6.66px)]
                "
              >
                {/* Product Image */}
                <Link to={`/product/${product._id}`}>
                  <div className="w-full aspect-[3.5/3.8] bg-gray-100">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-1.5">
                  <p className="text-[9px] font-bold text-black uppercase">{product.brand || "EXAMPLE BRAND"}</p>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-[10px] font-medium text-black leading-tight mb-0.5 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-black">₹{product.price}</span>
                    {discountPercentage > 0 && (
                      <>
                        <span className="text-[8px] text-gray-500 line-through">₹{product.originalPrice}</span>
                        <span className="text-[8px] text-green-500 font-semibold">{discountPercentage}% off</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
