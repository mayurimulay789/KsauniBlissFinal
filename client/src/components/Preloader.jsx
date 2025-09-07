"use client"

import { useState, useEffect } from "react"

export default function Preloader({ onComplete, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const phaseTimers = [
      setTimeout(() => setAnimationPhase(1), 500),
      setTimeout(() => setAnimationPhase(2), 1500),
      setTimeout(() => setAnimationPhase(3), 2500),
      setTimeout(() => setAnimationPhase(4), 3500),
    ]

    const completeTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onComplete?.(), 500)
    }, duration)

    return () => {
      phaseTimers.forEach(clearTimeout)
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#de0707] transition-opacity duration-500 ${
        !isVisible ? "opacity-0" : ""
      }`}
    >
      <div className="relative px-2 sm:px-4">
        <h1
          className={`font-black tracking-wider select-none transition-all duration-700 ease-out text-5xl sm:text-6xl md:text-8xl lg:text-9xl max-w-full text-center break-words ${
            animationPhase === 0
              ? "opacity-0 scale-95"
              : animationPhase === 1
                ? "opacity-100 scale-100 text-white"
                : animationPhase === 2
                  ? "opacity-100 scale-100 text-transparent"
                  : animationPhase >= 3
                    ? "opacity-100 scale-100 text-white"
                    : ""
          }`}
          style={{
            ...(animationPhase === 2 && {
              WebkitTextStroke: "2px white",
              textStroke: "2px white",
            }),
          }}
        >
          {"KSAUNIBLISS".split("").map((letter, index) => (
            <span
              key={index}
              className={`inline-block transition-all duration-500 ease-out ${
                animationPhase >= 1 ? "translate-y-0" : "translate-y-4 sm:translate-y-8"
              } ${animationPhase === 3 && index % 2 === 0 ? "text-transparent" : ""}`}
              style={{
                transitionDelay: `${index * 80}ms`,
                ...(animationPhase === 3 &&
                  index % 2 === 0 && {
                    WebkitTextStroke: "2px white",
                    textStroke: "2px white",
                  }),
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        <div
          className={`absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 transition-opacity duration-500 ${
            animationPhase >= 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
