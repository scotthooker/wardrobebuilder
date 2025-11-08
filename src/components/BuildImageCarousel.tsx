/**
 * BuildImageCarousel Component
 * Custom carousel for displaying build gallery images with JSON parsing support
 * Handles both string and array formats for image_gallery data from the API
 */

import { useState, type MouseEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Gallery item interface matching the database schema
 */
export interface GalleryItem {
  /**
   * Image URL path (relative to API_URL)
   */
  url: string
  /**
   * Optional AI-generated prompt used to create the image
   */
  prompt?: string
}

export interface BuildImageCarouselProps {
  /**
   * Gallery data - can be JSON string or array of GalleryItem objects
   * API may return either format: string or array
   */
  gallery: string | GalleryItem[] | null | undefined
  /**
   * Optional CSS classes to apply to the container
   */
  className?: string
}

/**
 * Parses gallery data and ensures it's a valid array
 * Handles both JSON string and array formats defensively
 */
function parseGallery(gallery: string | GalleryItem[] | null | undefined): GalleryItem[] {
  let parsedGallery: GalleryItem[] = []

  // Parse gallery if it's a string
  if (typeof gallery === 'string') {
    try {
      parsedGallery = JSON.parse(gallery)
    } catch (e) {
      console.error('Failed to parse gallery JSON:', e)
      parsedGallery = []
    }
  } else if (gallery) {
    parsedGallery = gallery
  }

  // Ensure parsedGallery is an array
  if (!Array.isArray(parsedGallery)) {
    return []
  }

  return parsedGallery
}

export function BuildImageCarousel({ gallery, className = '' }: BuildImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const parsedGallery = parseGallery(gallery)

  // No images - show placeholder
  if (parsedGallery.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No image</span>
      </div>
    )
  }

  // Single image - show without carousel controls
  if (parsedGallery.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={`${API_URL}${parsedGallery[0].url}`}
          alt="Build visualization"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  const goToPrevious = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? parsedGallery.length - 1 : prev - 1))
  }

  const goToNext = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === parsedGallery.length - 1 ? 0 : prev + 1))
  }

  const goToIndex = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(index)
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <img
        src={`${API_URL}${parsedGallery[currentIndex].url}`}
        alt={`Build visualization ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Navigation Arrows using Button component */}
      <Button
        variant="icon"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full opacity-0 group-hover:opacity-100 transition border-0 hover:border-0"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <Button
        variant="icon"
        size="icon"
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full opacity-0 group-hover:opacity-100 transition border-0 hover:border-0"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
        {parsedGallery.map((_, index) => (
          <button
            key={index}
            onClick={(e) => goToIndex(e, index)}
            className={`w-2 h-2 rounded-full transition ${
              index === currentIndex
                ? 'bg-white scale-110'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1} / {parsedGallery.length}
      </div>
    </div>
  )
}
