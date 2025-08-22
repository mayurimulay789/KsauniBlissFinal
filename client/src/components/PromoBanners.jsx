"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPromoBanners } from "../store/slices/bannerSlice"
import LoadingSpinner from "./LoadingSpinner"

// Utility function for countdown
const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date()
  let timeLeft = {}
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }
  return timeLeft
}

const PromoBanners = () => {
  const dispatch = useDispatch()
  const { promoBanners, isLoading } = useSelector((state) => state.banners)

  // Fetch promo banners on component mount
  useEffect(() => {
    dispatch(fetchPromoBanners())
  }, [dispatch])

  // Set a target date for the countdown
  const targetDate = "2024-12-13T00:00:00"
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate))
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  // Update countdown every second
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearTimeout(timer)
  })

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (promoBanners && promoBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % promoBanners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [promoBanners])

  // Prepare countdown timer components
  const timerComponents = []
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return
    }
    timerComponents.push(
      <div
        key={interval}
        className="flex flex-col items-center justify-center w-6 h-6 border rounded bg-white/20 backdrop-blur-sm border-white/30 sm:w-7 sm:h-7"
      >
               {" "}
        <span className="text-xs font-bold text-white sm:text-sm">{String(timeLeft[interval]).padStart(2, "0")}</span> 
              <span className="text-[10px] uppercase text-white/80">{interval.slice(0, 1)}</span>     {" "}
      </div>,
    )
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Get active banners or use default
  const activeBanners = promoBanners?.filter((banner) => banner.isActive) || []
  const defaultBanner = {
    _id: "default-deal",
    title: "SHOPPERS STOP",
    subtitle: "MIN. 30% OFF",
    description: "Discover amazing deals on premium fashion brands",
    image: { url: "/placeholder.svg?height=200&width=300&text=Fashion+Sale" },
    buttonText: "SHOP NOW",
    buttonLink: "/products?deal=true",
    brandLogo: "/placeholder.svg?height=40&width=80&text=BRAND",
  }
  const bannersToShow = activeBanners.length > 0 ? activeBanners : [defaultBanner]
  const currentBanner = bannersToShow[currentBannerIndex]

  return (
    <section className="relative w-full mx-auto mt-0 px-4">
            {/* Main Banner Container */}     {" "}
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg w-full mx-auto cursor-pointer"
        style={{
          border: "3px solid #be7a21ff",
        }}
      >
                {/* Banner Image */}       {" "}
        <img
          src={
            currentBanner?.image?.url ||
            "/placeholder.svg?height=280&width=1200&query=abstract category banner background"
          }
          alt={currentBanner?.title || "Promotional banner"}
          className="w-full h-36 sm:h-48 md:h-56 lg:h-80 xl:h-96 object-cover"
        />
                {/* Enhanced Pagination Dots */}       {" "}
        {bannersToShow.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                       {" "}
            {bannersToShow.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`transition-all duration-300 ${
                  index === currentBannerIndex
                    ? "w-6 h-2 bg-red-600 rounded-full shadow-lg"
                    : "w-2 h-2 bg-white/70 hover:bg-white rounded-full shadow-md"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
                     {" "}
          </div>
        )}
             {" "}
      </div>
            {/* Coupon Banner */}      {/* <CouponBanner /> */}   {" "}
    </section>
  )
}

export default PromoBanners
