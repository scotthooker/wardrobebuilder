/**
 * Carousel Component
 * An image carousel with navigation buttons, dot indicators, and keyboard support
 * Supports custom content beyond images with auto-height or fixed height options
 */

import { forwardRef, useState, useEffect, type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const carouselVariants = cva('relative w-full overflow-hidden rounded-xl', {
  variants: {
    height: {
      auto: 'h-auto',
      sm: 'h-64',
      md: 'h-96',
      lg: 'h-[32rem]',
      xl: 'h-[40rem]',
      full: 'h-screen',
    },
  },
  defaultVariants: {
    height: 'auto',
  },
})

export interface CarouselItem {
  /**
   * Unique identifier
   */
  id: string | number
  /**
   * Content to display (can be image URL or custom React node)
   */
  content: ReactNode
  /**
   * Optional alt text for images
   */
  alt?: string
  /**
   * Optional caption
   */
  caption?: string
}

export interface CarouselProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof carouselVariants> {
  /**
   * Array of carousel items
   */
  items: CarouselItem[]
  /**
   * Initial slide index
   */
  initialSlide?: number
  /**
   * Auto-advance interval in milliseconds (0 to disable)
   */
  autoPlay?: number
  /**
   * Show navigation arrows
   */
  showArrows?: boolean
  /**
   * Show dot indicators
   */
  showDots?: boolean
  /**
   * Show image counter (e.g., "2 / 5")
   */
  showCounter?: boolean
  /**
   * Enable keyboard navigation
   */
  keyboardNavigation?: boolean
  /**
   * Callback when slide changes
   */
  onSlideChange?: (index: number) => void
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      className,
      items,
      initialSlide = 0,
      autoPlay = 0,
      showArrows = true,
      showDots = true,
      showCounter = true,
      keyboardNavigation = true,
      height,
      onSlideChange,
      ...props
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(initialSlide)

    const goToSlide = (index: number) => {
      const newIndex = (index + items.length) % items.length
      setCurrentIndex(newIndex)
      onSlideChange?.(newIndex)
    }

    const goToPrevious = () => goToSlide(currentIndex - 1)
    const goToNext = () => goToSlide(currentIndex + 1)

    // Auto-play
    useEffect(() => {
      if (autoPlay > 0) {
        const interval = setInterval(goToNext, autoPlay)
        return () => clearInterval(interval)
      }
    }, [autoPlay, currentIndex])

    // Keyboard navigation
    useEffect(() => {
      if (!keyboardNavigation) return

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
          goToPrevious()
        } else if (event.key === 'ArrowRight') {
          goToNext()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [keyboardNavigation, currentIndex])

    if (items.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            carouselVariants({ height }),
            'flex items-center justify-center bg-gray-100',
            className
          )}
        >
          <p className="text-text-secondary">No items to display</p>
        </div>
      )
    }

    const currentItem = items[currentIndex]

    return (
      <div
        ref={ref}
        className={cn(carouselVariants({ height }), 'group', className)}
        {...props}
      >
        {/* Carousel content */}
        <div className="relative h-full w-full">
          {typeof currentItem.content === 'string' ? (
            <img
              src={currentItem.content}
              alt={currentItem.alt || `Slide ${currentIndex + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full">{currentItem.content}</div>
          )}

          {/* Caption */}
          {currentItem.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
              <p className="text-sm text-white">{currentItem.caption}</p>
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        {showArrows && items.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-text-primary shadow-lg transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-text-primary shadow-lg transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Counter */}
        {showCounter && items.length > 1 && (
          <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
            {currentIndex + 1} / {items.length}
          </div>
        )}

        {/* Dot indicators */}
        {showDots && items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50',
                  index === currentIndex
                    ? 'w-6 bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)

Carousel.displayName = 'Carousel'
