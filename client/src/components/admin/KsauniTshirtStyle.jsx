"use client"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { fetchKsauniTshirts } from "../../store/slices/ksauniTshirtSlice"
import LoadingSpinner from "../LoadingSpinner"

const KsauniTshirtStyle = () => {
  const dispatch = useDispatch()
  const { tshirts, loading, error } = useSelector((state) => state.ksauniTshirt)

  const carouselRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    dispatch(fetchKsauniTshirts()).catch((error) => {
      console.error("[v0] KsauniTshirtStyle fetch error:", error)
    })
  }, [dispatch])

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft
      const itemWidth = carouselRef.current.firstChild?.offsetWidth + 16 || 0
      const index = Math.round(scrollLeft / itemWidth)
      setCurrentSlide(index)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) {
    console.error("[v0] KsauniTshirtStyle Redux error:", error)
    return null
  }
  if (!tshirts.length) return null

  return (
    <section className="py-8 sm:py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-2 text-left flex items-center justify-between"
        >
          <h2 className="text-[18px] font-bold text-black mb-2">KSAUNI TSHIRT STYLE</h2>
        </motion.div>

        <div className="relative">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-3 px-3"
          >
            {tshirts.map((tshirt, index) => (
              <motion.div
                key={tshirt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 border border-gray-500/80 hover:border-gray-800/80 transition-colors duration-200 rounded-[5px] bg-white overflow-hidden shadow-sm w-[calc(40%-4px)] min-[480px]:w-[calc(33.333%-5.33px)] sm:w-[calc(25%-6px)] md:w-[calc(20%-6.4px)] lg:w-[calc(16.666%-6.66px)]"
              >
                <div className="w-full aspect-[3.5/3.8] bg-gray-100">
                  <img
                    src={tshirt.image?.url || "/placeholder.svg"}
                    alt={tshirt.image?.alt || tshirt.name}
                    className="w-full h-full object-cover"
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
