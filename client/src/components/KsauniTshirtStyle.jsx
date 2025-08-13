"use client"
import { useNavigate, Link } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Plus } from 'lucide-react'
import { fetchNewArrivals } from "../store/slices/productSlice"
import LoadingSpinner from "./LoadingSpinner"

const KsauniTshirtStyle = () => {
    const dispatch = useDispatch()
    const { newArrivals, isLoadingNewArrivals } = useSelector((state) => state.products)
    const navigate = useNavigate()

    const carouselRef = useRef(null)
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        dispatch(fetchNewArrivals())
    }, [dispatch])

    const handleScroll = () => {
        if (carouselRef.current) {
            const scrollLeft = carouselRef.current.scrollLeft
            const itemWidth = carouselRef.current.firstChild.offsetWidth + 16
            const index = Math.round(scrollLeft / itemWidth)
            setCurrentSlide(index)
        }
    }

    if (isLoadingNewArrivals) return <LoadingSpinner />
    if (!newArrivals.length) return null

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
                    <h2 className="text-[18px] font-bold text-black mb-2">
                        KSAUNI TSHIRT STYLE
                    </h2>
                    <Link to="/products" className="text-black hover:text-red-500 transition-colors">
                        <Plus className="w-6 h-6" />
                    </Link>
                </motion.div>

                <div className="relative">
                    <div
                        ref={carouselRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-3 px-3"
                    >
                        {newArrivals.map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="flex-shrink-0 border border-gray-500/80 hover:border-gray-800/80 transition-colors duration-200 rounded-[5px] bg-white overflow-hidden shadow-sm w-[calc(40%-4px)] min-[480px]:w-[calc(33.333%-5.33px)] sm:w-[calc(25%-6px)] md:w-[calc(20%-6.4px)] lg:w-[calc(16.666%-6.66px)]"
                            >
                                <Link to={`/product/${product._id}`}>
                                    <div className="w-full aspect-[3.5/3.8] bg-gray-100">
                                        <img
                                            src={product.images?.[0]?.url || "/placeholder.svg"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default KsauniTshirtStyle
