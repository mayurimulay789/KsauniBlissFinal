"use client"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"

const CategoryBanner = () => {
  const { banners: allBanners } = useSelector((state) => state.banners)
  const { categories } = useSelector((state) => state.categories)
  const [searchParams] = useSearchParams()
  const [currentBanner, setCurrentBanner] = useState(0)
  const [filteredBanners, setFilteredBanners] = useState([])

  const categoryId = searchParams.get("category")

  useEffect(() => {
    if (allBanners && Array.isArray(allBanners)) {
      const categoryBanners = allBanners.filter((banner) => banner?.type === "category")
      console.log("[v0] Found category banners:", categoryBanners.length)

      // Log banner structure for debugging
      categoryBanners.forEach((banner, index) => {
        if (banner) {
          console.log(`[v0] Banner ${index}:`, {
            id: banner._id,
            type: banner.type,
            image: banner.image,
            imageUrl: banner.image?.url,
          })
        }
      })

      setFilteredBanners(categoryBanners)
    } else {
      setFilteredBanners([])
    }
  }, [allBanners]) // Use allBanners as dependency instead of categoryBanners

  useEffect(() => {
    if (filteredBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % filteredBanners.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [filteredBanners.length])

  if (!filteredBanners.length) {
    return (
      <section className="relative w-full px-0 mx-auto mt-0 mb-6 sm:px-6">
        <div
          className="relative w-full mx-auto overflow-hidden shadow-lg cursor-pointer rounded-2xl group"
          style={{
            border: "3px solid #be7a21ff",
          }}
        >
          <img
            src="/placeholder-wgz1d.png"
            alt="Category Banner"
            className="object-cover w-screen h-24 max-w-full transition-transform duration-500 sm:h-48 md:h-56 lg:h-64 group-hover:scale-105 rounded-2xl"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full px-0 mx-auto mt-0 mb-6 sm:px-6">
      <div
        className="relative w-full mx-auto overflow-hidden shadow-lg cursor-pointer rounded-2xl group"
        style={{
          border: "3px solid #be7a21ff",
        }}
      >
        <img
          src={
            filteredBanners[currentBanner]?.image?.url ||
            filteredBanners[currentBanner]?.image ||
            filteredBanners[currentBanner]?.imageUrl ||
            `/api/uploads/${filteredBanners[currentBanner]?.image || "/placeholder.svg"}` ||
            "/category-banner.png"
          }
          alt={filteredBanners[currentBanner]?.title || "Category promotional banner"}
          className="object-cover w-screen h-24 max-w-full transition-transform duration-500 sm:h-48 md:h-56 lg:h-64 group-hover:scale-105 rounded-2xl"
          onError={(e) => {
            console.log("[v0] Image failed to load:", e.target.src)
            e.target.src = "/fallback-banner.png"
          }}
          onLoad={() => {
            console.log("[v0] Image loaded successfully")
          }}
        />

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
