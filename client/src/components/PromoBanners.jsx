"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPromoBanners } from "../store/slices/bannerSlice";
import LoadingSpinner from "./LoadingSpinner";

// ---------------------
// Utility: Countdown Timer
// ---------------------
const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {};
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

const PromoBanners = () => {
  const dispatch = useDispatch();
  const { promoBanners, isLoading } = useSelector((state) => state.banners);

  // Fetch promo banners on mount
  useEffect(() => {
    dispatch(fetchPromoBanners());
  }, [dispatch]);

  // Countdown logic
  const targetDate = "2024-12-13T00:00:00";
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Update countdown every second
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearTimeout(timer);
  });

  // Auto-rotate banners every 5s
  useEffect(() => {
    if (promoBanners && promoBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % promoBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [promoBanners]);

  // Countdown UI
  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) return;
    timerComponents.push(
      <div
        key={interval}
        className="flex flex-col items-center justify-center
                   w-7 h-7 border rounded bg-white/20 backdrop-blur-sm border-white/30
                   sm:w-8 sm:h-8"
      >
        <span className="text-xs font-bold text-white sm:text-sm">
          {String(timeLeft[interval]).padStart(2, "0")}
        </span>
        <span className="text-[10px] uppercase text-white/80">
          {interval.slice(0, 1)}
        </span>
      </div>
    );
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Active banners or fallback
  const activeBanners = promoBanners?.filter((banner) => banner.isActive) || [];
  const defaultBanner = {
    _id: "default-deal",
    title: "SHOPPERS STOP",
    subtitle: "MIN. 30% OFF",
    description: "Discover amazing deals on premium fashion brands",
    image: { url: "/placeholder.svg?height=600&width=1920&text=Fashion+Sale" },
    buttonText: "SHOP NOW",
    buttonLink: "/products?deal=true",
    brandLogo: "/placeholder.svg?height=40&width=80&text=BRAND",
  };
  const bannersToShow = activeBanners.length > 0 ? activeBanners : [defaultBanner];
  const currentBanner = bannersToShow[currentBannerIndex];

  // ---------------------
  // UI
  // ---------------------
  return (
    <section className="relative w-full mt-4 px-2 sm:px-2">
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg w-full max-w-[1270px] mx-auto cursor-pointer"
        style={{ border: "3px solid #be7a21" }}
      >
        {/* Banner Image with Redirect */}
        <img
          src={
            currentBanner?.image?.url ||
            "/placeholder.svg?height=600&width=1920&text=Fashion+Sale"
          }
          alt={currentBanner?.title || "Promotional banner"}
          className="w-full h-auto object-cover rounded-2xl"
          width={1270} // ✅ Explicit width for optimization
          height={400} // ✅ Approximate height (browser adjusts if different)
          onClick={() => {
            if (currentBanner?.bannerLink) {
              window.location.href = currentBanner.bannerLink; // 🔗 Redirect
            }
          }}
          style={{
            cursor: currentBanner?.bannerLink ? "pointer" : "default",
          }}
        />

        {/* Countdown Timer (optional) */}
        {timerComponents.length > 0 && (
          <div className="absolute bottom-2 right-2 flex gap-1 sm:gap-2">
            {timerComponents}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromoBanners;
