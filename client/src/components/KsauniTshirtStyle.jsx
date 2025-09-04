"use client"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchKsauniTshirts } from "../../store/slices/ksauniTshirtSlice"
import LoadingSpinner from "../LoadingSpinner"

const KsauniTshirtStyle = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { tshirts, loading, error } = useSelector((state) => state.ksauniTshirt)

  const carouselRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Fetch T-shirts from Redux
  useEffect(() => {
    dispatch(fetchKsauniTshirts()).catch((error) => {
      console.error("[v1] KsauniTshirtStyle fetch error:", error)
    })
  }, [dispatch])

  // Handle scroll progress (optional)
  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft
      const itemWidth = carouselRef.current.firstChild?.offsetWidth + 16 || 0
      const index = Math.round(scrollLeft / itemWidth)
      setCurrentSlide(index)
    }
  }

  const handleIndividualTshirtClick = (tshirt) => {
    console.log("[v1] Individual t-shirt clicked:", tshirt)
    navigate("/products", { state: { selectedTshirt: tshirt } })
  }

  if (loading) return <LoadingSpinner />
  if (error) {
    console.error("[v1] KsauniTshirtStyle Redux error:", error)
    return null
  }
  if (!tshirts.length) return null

  return (
    <section className="py-4 bg-white">
      <div className="px-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section Heading */}
        <h2 className="text-[20px] font-bold text-black mb-4">
          KSAUNI TSHIRT STYLE
        </h2>

        {/* Scrollable Carousel */}
        <div className="relative">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide -mx-3 px-3"
          >
            {tshirts.map((tshirt, index) => (
              <motion.div
                key={tshirt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleIndividualTshirtClick(tshirt)}
                className="
                  flex-shrink-0 
                  border border-gray-300 hover:border-gray-600 
                  rounded-lg bg-white overflow-hidden shadow-md 
                  transition-all duration-200 cursor-pointer
                  w-[65%]    /* Mobile: ~1.5 items */
                  sm:w-[48%] /* Tablet: 2 items */
                  lg:w-[30%] /* Desktop: 3 items */
                "
              >
                {/* Image container */}
                <div className="w-full aspect-[3/5] bg-gray-100">
                  <img
                    src={tshirt.image?.url || "/placeholder.svg"}
                    alt={tshirt.image?.alt || tshirt.name}
                    className="w-full h-full object-cover"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleIndividualTshirtClick(tshirt)
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default KsauniTshirtStyle
