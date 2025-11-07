import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function BuildImageCarousel({ gallery, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Parse gallery if it's a string, and ensure it's an array
  let parsedGallery = gallery;
  if (typeof gallery === 'string') {
    try {
      parsedGallery = JSON.parse(gallery);
    } catch (e) {
      parsedGallery = [];
    }
  }

  // Ensure parsedGallery is an array
  if (!Array.isArray(parsedGallery)) {
    parsedGallery = [];
  }

  if (!parsedGallery || parsedGallery.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No image</span>
      </div>
    );
  }

  // If only one image, show it without carousel controls
  if (parsedGallery.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={`${API_URL}${parsedGallery[0].url}`}
          alt="Build visualization"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const goToPrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? parsedGallery.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === parsedGallery.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <img
        src={`${API_URL}${parsedGallery[currentIndex].url}`}
        alt={`Build visualization ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

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
  );
}
