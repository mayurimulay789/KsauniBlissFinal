"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchCategoryBanners } from "../store/slices/bannerSlice" // ✅ Adjust this path as needed

const CategoryBanner = () => {
  const dispatch = useDispatch()

  // Redux state
  const { categoryBanners, loadingCategory, error } = useSelector((state) => state.banners)

  // State for rotating banners
  const [currentBanner, setCurrentBanner] = useState(0)

  // 🔁 Fetch banners on component mount
  useEffect(() => {
    dispatch(fetchCategoryBanners())
  }, [dispatch])

  // 🔁 Auto-rotate banner every 5 seconds
  useEffect(() => {
    if (categoryBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % categoryBanners.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [categoryBanners.length])

  // ⛔ Show nothing or fallback if loading fails
  if (loadingCategory || error) {
    return (
      <section className="relative w-full px-0 mx-auto mt-0 mb-6 sm:px-6">
        <div className="relative w-full mx-auto overflow-hidden shadow-lg rounded-2xl">
          <img
            src="/placeholder-wgz1d.png"
            alt="Loading category banner..."
            className="object-cover w-screen h-24 max-w-full sm:h-48 md:h-56 lg:h-64 rounded-2xl"
          />
        </div>
      </section>
    )
  }

  // ❓ Fallback if no banners are available
  if (!categoryBanners.length) {
    return (
      <section className="relative w-full px-0 mx-auto mt-0 mb-6 sm:px-6">
        <div
          className="relative w-full mx-auto overflow-hidden shadow-lg rounded-2xl"
          style={{ border: "3px solid #be7a21ff" }}
        >
          <img
            src="/placeholder-wgz1d.png"
            alt="No category banners"
            className="object-cover w-screen h-24 max-w-full sm:h-48 md:h-56 lg:h-64 rounded-2xl"
          />
        </div>
      </section>
    )
  }

  const current = categoryBanners[currentBanner]

  return (
    <section className="relative w-full px-0 mx-auto mt-0 mb-6 sm:px-6">
      <div
        className="relative w-full mx-auto overflow-hidden shadow-lg cursor-pointer rounded-2xl group"
        style={{ border: "3px solid #be7a21ff" }}
      >
        <img
          src={
            current?.image?.url ||
            current?.image ||
            current?.imageUrl ||
            `/api/uploads/${current?.image}` ||
            "/fallback-banner.png"
          }
          alt={current?.title || "Category promotional banner"}
          className="object-cover w-screen h-24 max-w-full transition-transform duration-500 sm:h-48 md:h-56 lg:h-64 group-hover:scale-105 rounded-2xl"
          onError={(e) => {
            console.log("[v0] Image failed to load:", e.target.src)
            e.target.src = "/fallback-banner.png"
          }}
          onLoad={() => {
            console.log("[v0] Image loaded successfully")
          }}
        />

        {categoryBanners.length > 1 && (
          <div className="absolute z-30 flex space-x-2 transform -translate-x-1/2 bottom-4 left-1/2">
            {categoryBanners.map((_, index) => (
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
