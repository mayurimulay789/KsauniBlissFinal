"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const PriceSelection = ({ onPriceSelect, selectedPrice }) => {
  const [selectedOption, setSelectedOption] = useState(selectedPrice || null)
  const navigate = useNavigate()

  const priceOptions = [
    { id: "discount", label: "70%", sublabel: "OFF", value: "70", type: "discount", route: "/products?discount=70" },
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
    <div className="relative z-20 w-full py-5 bg-white">
      {/* Added relative z-20 and py-8 for proper spacing */}
      <div className="px-4 mx-auto max-w-7xl">
        {/* Added container with max-width and padding */}
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-xl italic font-black sm:text-4xl">
            <span className="text-red-600">PRICE</span> <span className="text-black">SELECTION</span>
          </h1>
          <p className="text-sm font-medium text-gray-700 sm:text-base">Styles ab Budget mee</p>
        </div>
        {/* Price Grid */}
        <div className="flex justify-center">
          <div className="grid w-full max-w-screen-xl grid-cols-4 gap-3 px-4 sm:grid-cols-4 sm:gap-10">
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
                <div className="bg-red-600 text-white aspect-[3/4] sm:aspect-[4/4] flex flex-col items-center justify-center font-black text-center relative overflow-hidden hover:bg-red-700 transition-colors">
                  {/* Black border */}
                  <div className="absolute inset-[6%] border-2 border-black"></div>

                  {/* Top serrated edge */}
                  <div className="absolute top-0 left-0 right-0 h-[6%] bg-white">
                    <div className="flex">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full bg-red-600"
                          style={{
                            clipPath:
                              i % 2 === 0 ? "polygon(0 0, 100% 0, 50% 100%)" : "polygon(50% 0, 100% 100%, 0 100%)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Card content */}
                  {option.type === "discount" ? (
                    <>
                      <div className="text-3xl leading-none sm:text-8xl md:text-5xl">{option.label}</div>
                      <div className="mb-3 text-2xl leading-none sm:text-4xl md:text-xl sm:mt-3">{option.sublabel}</div>
                    </>
                  ) : (
                    <>
                      <div className="mb-1 font-normal leading-tight text-md sm:text-5xl md:text-3xl">
                        {option.label}
                      </div>
                      <div className="mb-3 font-normal leading-tight text-md sm:text-lg">{option.sublabel}</div>
                    </>
                  )}

                  {/* Arrow */}
                  <div className="flex items-center justify-center w-3 h-3 bg-white rounded-full sm:w-5 sm:h-5">
                    <ArrowRight className="w-3 h-3 text-red-800 sm:w-3 sm:h-3" />
                  </div>

                  {/* Bottom serrated edge */}
                  <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-white">
                    <div className="flex">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full bg-red-600"
                          style={{
                            clipPath:
                              i % 2 === 0 ? "polygon(50% 0, 100% 100%, 0 100%)" : "polygon(0 0, 100% 0, 50% 100%)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Left serrated edge */}
                  <div className="absolute top-0 bottom-0 left-0 w-[6%] bg-white">
                    <div className="flex flex-col h-full">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 w-full bg-red-600"
                          style={{
                            clipPath:
                              i % 2 === 0 ? "polygon(0 0, 0 100%, 100% 50%)" : "polygon(100% 0, 0 50%, 100% 100%)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right serrated edge */}
                  <div className="absolute top-0 bottom-0 right-0 w-[6%] bg-white">
                    <div className="flex flex-col h-full">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 w-full bg-red-600"
                          style={{
                            clipPath:
                              i % 2 === 0 ? "polygon(100% 0, 100% 100%, 0 50%)" : "polygon(0 0, 100% 50%, 0 100%)",
                          }}
                        />
                      ))}
                    </div>
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
