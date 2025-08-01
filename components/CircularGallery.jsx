"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "../components/ui/button"

// Profile card data structure:
// { id: number, name: string, role: string, avatar: string, trending: boolean }

const profiles = [
  {
    id: 1,
    name: "Daniel Lee",
    role: "Graphic Designer",
    avatar: "/profiles/1.avif",
    trending: true,
  },
  {
    id: 2,
    name: "Emily Taylor",
    role: "Social Media Manager",
    avatar: "/profiles/2.avif",
    trending: true,
  },
  {
    id: 3,
    name: "Siddharth T S",
    role: "Web Developer",
    avatar: "/profiles/3.jpeg",
    trending: true,
  },
]

export default function CircularGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % profiles.length)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length)
  }

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return
    setIsAnimating(true)
    setCurrentIndex(index)
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [currentIndex])

  const getCardStyle = (index) => {
    const totalCards = profiles.length
    const visibleCards = 5 // Show 5 cards for smoother transitions

    // Calculate the position relative to current index
    let position = (index - currentIndex + totalCards) % totalCards

    // Adjust position to center around the middle
    if (position > Math.floor(totalCards / 2)) {
      position = position - totalCards
    }

    const isCenter = position === 0
    const isVisible = Math.abs(position) <= 1 // Only center and immediate neighbors are fully visible
    const isTransitioning = Math.abs(position) === 2 // Cards that are transitioning in/out

    // Linear horizontal spacing - handle SSR
    const spacing = typeof window !== 'undefined' 
      ? (window.innerWidth < 640 ? 200 : window.innerWidth < 1024 ? 240 : 280)
      : 240 // default for SSR
    const x = position * spacing

    // Position side cards lower than center card
    const y = isCenter ? 0 : 30

    // Rotate cards away from center
    const rotation = position * 8

    // Scale and styling based on position
    let scale, opacity, zIndex

    if (isVisible) {
      // Main 3 visible cards
      scale = isCenter ? 1.1 : 0.95
      opacity = isCenter ? 1 : 0.8
      zIndex = isCenter ? 20 : 10 - Math.abs(position)
    } else if (isTransitioning) {
      // Cards transitioning in/out - smaller and completely transparent
      scale = 0.7
      opacity = 0 // Changed from 0.3 to 0
      zIndex = 5
    } else {
      // Completely hidden cards
      return { display: "none" }
    }

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
      zIndex,
      opacity,
      transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4" style={{ background: 'transparent' }}>
      <div className="relative w-full max-w-sm sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm hover:bg-white border-gray-200 shadow-md"
          onClick={prevSlide}
          disabled={isAnimating}
        >
          <ChevronLeft className="h-4 w-4" style={{ color: "#ADFF00" }} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm hover:bg-white border-gray-200 shadow-md"
          onClick={nextSlide}
          disabled={isAnimating}
        >
          <ChevronRight className="h-4 w-4" style={{ color: "#ADFF00" }} />
        </Button>

        {/* Cards Container */}
        <div className="relative h-[320px] sm:h-[360px] lg:h-[400px] xl:h-[440px] flex items-center justify-center overflow-hidden px-4">
          {profiles.map((profile, index) => {
            const style = getCardStyle(index)
            const isCenter = (index - currentIndex + profiles.length) % profiles.length === 0

            return (
              <div
                key={profile.id}
                className={`absolute w-48 h-64 sm:w-56 sm:h-72 lg:w-64 lg:h-80 cursor-pointer rounded-2xl overflow-hidden ${
                  isCenter ? "ring-4 ring-black shadow-2xl" : "ring-1 ring-gray-300 shadow-lg"
                }`}
                style={style}
                onClick={() => goToSlide(index)}
              >
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden transform-gpu flex flex-col">
                  {/* Image Area */}
                  <div className="relative flex-1 bg-gray-400 overflow-hidden">
                    <img
                      src={profile.avatar}
                      alt={`${profile.name} profile`}
                      className="w-full h-full object-cover"
                    />
                    {profile.trending && (
                      <div
                        className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold"
                        style={{ color: "#ADFF00" }}
                      >
                        Trending
                      </div>
                    )}
                  </div>

                  {/* Profile Info - Black Bottom Section */}
                  <div className="bg-gradient-to-r from-gray-900 to-black text-white flex items-center justify-between p-3 sm:p-4 rounded-b-2xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg" style={{ color: "#ADFF00" }}>
                        {profile.name}
                      </h3>
                      <p className="text-gray-300 text-xs sm:text-sm mt-0.5">{profile.role}</p>
                    </div>
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ml-2"
                      style={{ backgroundColor: "#ADFF00" }}
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center mt-8 space-x-2">
          {profiles.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-8" : "hover:bg-gray-400"
              }`}
              style={{
                backgroundColor: index === currentIndex ? "#ADFF00" : "#9CA3AF",
              }}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
