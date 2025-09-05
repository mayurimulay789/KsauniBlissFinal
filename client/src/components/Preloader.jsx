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

  const handleVideoLoad = () => setVideoLoaded(true)
  const handleVideoError = () => setVideoError(true)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-black w-screen h-screen overflow-hidden flex items-center justify-center"
          style={{
            width: "100vw",
            height: "100vh",
            minHeight: "-webkit-fill-available",
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Loader text */}
            {!videoLoaded && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-base xs:text-lg sm:text-xl md:text-2xl font-medium animate-pulse text-center px-2">
                  Loading...
                </div>
              </div>
            )}

            {/* Error fallback */}
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="text-white text-center max-w-xs sm:max-w-sm">
                  <div className="text-xl sm:text-2xl md:text-4xl mb-3 font-bold">KsauniBliss</div>
                  <div className="text-xs sm:text-sm md:text-base opacity-80">
                    Loading your experience...
                  </div>
                </div>
              </div>
            )}

            {/* Video */}
            <video
              autoPlay
              muted
              playsInline
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              onEnded={() => {
                setIsVisible(false)
                setTimeout(onComplete, 500)
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            >
              <source src="/preloader.mp4" type="video/mp4" />
            </video>

            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { Preloader }
export default Preloader
