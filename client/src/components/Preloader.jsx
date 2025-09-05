"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Preloader = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  const handleVideoError = (e) => {
    setVideoError(true)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-black w-screen h-screen overflow-hidden"
          style={{
            width: "100vw",
            height: "100vh",
            minHeight: "-webkit-fill-available",
          }}
        >
          <div className="relative w-full h-full">
            {!videoLoaded && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-lg sm:text-xl md:text-2xl font-medium animate-pulse text-center px-4">
                  Loading...
                </div>
              </div>
            )}

            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center px-6 max-w-xs sm:max-w-sm">
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-4 font-bold">KsauniBliss</div>
                  <div className="text-sm sm:text-base opacity-80">Loading your experience...</div>
                </div>
              </div>
            )}

            <video
              autoPlay
              muted
              playsInline
              webkit-playsinline="true"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              onEnded={() => {
                setIsVisible(false)
                setTimeout(onComplete, 500)
              }}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{
                objectFit: "cover",
                objectPosition: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <source src="/Preloader.mp4" type="video/mp4" />
            </video>

            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onComplete, 500)
              }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 
                         px-4 py-2 sm:px-6 sm:py-3 
                         text-sm sm:text-base 
                         text-white bg-black/50 backdrop-blur-sm 
                         rounded-full hover:bg-black/70 active:bg-black/80 
                         transition-all duration-200 
                         min-h-[44px] min-w-[70px] sm:min-h-[48px] sm:min-w-[80px]
                         flex items-center justify-center font-medium 
                         border border-white/30 hover:border-white/50
                         touch-manipulation select-none"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { Preloader }
export default Preloader
