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
    <section className="relative w-full  mt-4 mx-2 px-4">
      <div
  className="relative overflow-hidden rounded-2xl shadow-lg w-full aspect-[3/1] mx-auto cursor-pointer"
  style={{ border: "3px solid #be7a21ff" }}
>
  <img
    src={
      currentBanner?.image?.url ||
      "/placeholder.svg?height=600&width=1920&text=Fashion+Sale"
    }
    alt={currentBanner?.title || "Promotional banner"}
    className="w-full h-full object-cover"
  />
</div>

            {/* Coupon Banner */}      {/* <CouponBanner /> */}   {" "}
    </section>
  )
}

export default PromoBanners
