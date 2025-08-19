"use client"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"

const CategoryBanner = () => {
  const { categoryBanners } = useSelector((state) => state.banners)
  const { categories } = useSelector((state) => state.categories)
  const [searchParams] = useSearchParams()
  const [currentBanner, setCurrentBanner] = useState(0)
  const [filteredBanners, setFilteredBanners] = useState([])

  const categoryId = searchParams.get("category")
  
  // Filter banners based on current category
  useEffect(() => {
    if (categoryId && categoryBanners.length > 0) {
      const category = categories.find(cat => cat._id === categoryId)
      if (category) {
        const banners = categoryBanners.filter(banner => 
          banner.category === categoryId || banner.category === category.slug
        )
        setFilteredBanners(banners)
      } else {
        setFilteredBanners([])
      }
    } else {
      // Show all category banners if no specific category is selected
      setFilteredBanners(categoryBanners)
    }
  }, [categoryId, categoryBanners, categories])

  useEffect(() => {
    if (filteredBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % filteredBanners.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [filteredBanners.length])

  if (!filteredBanners.length) {
    return null
  }

  const currentCategory = categories.find(cat => cat._id === categoryId)

  return (
<section className="relative w-full px-0 mx-auto mt-0 mb-6 sm:px-6">
      {/* Category Title */}
      {currentCategory && (
        <div className="mb-4 text-center">
          
        </div>
      )}

      {/* Main Banner Container */}
      <div
        className="relative w-full mx-auto overflow-hidden shadow-lg cursor-pointer rounded-2xl group"
        style={{
          border: "3px solid #be7a21ff",
        }}
      >
        {/* Banner Image */}
        <img
          src={filteredBanners[currentBanner]?.image?.url || "/placeholder.svg?height=280&width=1200&query=abstract category banner background"}
          alt={filteredBanners[currentBanner]?.image?.alt || `${currentCategory?.name || 'Category'} promotional banner`}
          className="object-cover w-screen h-24 max-w-full transition-transform duration-500 sm:h-48 md:h-56 lg:h-64 group-hover:scale-105 rounded-2xl"
        />

        {/* Banner Content Overlay */}
        

        {/* Enhanced Pagination Dots */}
        {filteredBanners.length > 1 && (
          <div className="absolute z-30 flex space-x-2 transform -translate-x-1/2 bottom-4 left-1/2">
            {filteredBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`transition-all duration-300 ${
                  index === currentBanner
                    ? "w-6 h-2 bg-red-600 rounded-full shadow-lg"
                    : "w-2 h-2 bg-white/70 hover:bg-white rounded-full shadow-md"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CategoryBanner