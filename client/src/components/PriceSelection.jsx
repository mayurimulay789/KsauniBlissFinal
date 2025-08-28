"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const PriceSelection = ({ onPriceSelect, selectedPrice }) => {
  const [selectedOption, setSelectedOption] = useState(selectedPrice || null)
  const navigate = useNavigate()

  const priceOptions = [
    { id: "under549", label: "UNDER", sublabel: "₹549", value: "549", type: "under", route: "/products?maxPrice=549" },
    { id: "under799", label: "UNDER", sublabel: "₹799", value: "799", type: "under", route: "/products?maxPrice=799" },
    { id: "under999", label: "UNDER", sublabel: "₹999", value: "999", type: "under", route: "/products?maxPrice=999" },
  ]

  const handleOptionClick = (option) => {
    setSelectedOption(option.id)
    if (onPriceSelect) onPriceSelect(option)
    navigate(option.route)
  }

  return (
    <div className="relative z-20 w-full py-6 bg-white">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl italic font-black sm:text-3xl md:text-4xl">
            <span className="text-red-600">PRICE</span>{" "}
            <span className="text-black">SELECTION</span>
          </h1>
          <p className="text-sm font-medium text-gray-700 sm:text-base">
            Styles ab Budget mee
          </p>
        </div>

        {/* Price Grid */}
        <div className="flex justify-center">
          <div className="grid w-full max-w-screen-md grid-cols-3 gap-8 sm:grid-cols-3 sm:gap-8">
            {priceOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionClick(option)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  selectedOption === option.id ? "ring-4 ring-red-800" : ""
                }`}
              >
                <div className="bg-red-600 text-white aspect-[3/4] sm:aspect-[4/5] flex flex-col items-center justify-center font-black text-center relative overflow-hidden hover:bg-red-700 transition-colors rounded-lg shadow-md">
                  
                  {/* Black border */}
                  <div className="absolute inset-[6%] border-2 border-black rounded-lg"></div>

                  {/* Card content */}
                  <div className="mb-1 text-lg font-semibold leading-tight sm:text-2xl md:text-3xl">
                    {option.label}
                  </div>
                  <div className="mb-3 text-base font-medium sm:text-lg md:text-xl">
                    {option.sublabel}
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full sm:w-6 sm:h-6">
                    <ArrowRight className="w-4 h-4 text-red-800" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceSelection
