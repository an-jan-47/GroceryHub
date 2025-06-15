import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BannerCard from './BannerCard';
import { getBanners } from '@/services/bannerService';

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMounted = useRef(true);
  
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const bannersLength = banners.length;

  // Memoized navigation functions
  const goToNextSlide = useCallback(() => {
    if (bannersLength <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % bannersLength);
  }, [bannersLength]);

  const goToPrevSlide = useCallback(() => {
    if (bannersLength <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + bannersLength) % bannersLength);
  }, [bannersLength]);

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= bannersLength) return;
    setCurrentSlide(index);
  }, [bannersLength]);

  // Reset slide position when banners change (only when bannersLength changes)
  useEffect(() => {
    if (bannersLength > 0 && currentSlide >= bannersLength) {
      setCurrentSlide(0);
    }
  }, [bannersLength]); // Remove currentSlide from dependencies to prevent infinite loop

  // Auto-advance timer with proper cleanup
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only create timer if we have multiple banners
    if (bannersLength > 1 && isComponentMounted.current) {
      timerRef.current = setInterval(() => {
        // Check if component is still mounted before updating state
        if (isComponentMounted.current) {
          setCurrentSlide((prev) => (prev + 1) % bannersLength);
        }
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [bannersLength]);

  // Component cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    // Pause auto-advance on touch
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diffX = touchStartX.current - touchEndX.current;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }

    // Restart auto-advance after touch
    if (bannersLength > 1 && isComponentMounted.current) {
      timerRef.current = setInterval(() => {
        if (isComponentMounted.current) {
          setCurrentSlide((prev) => (prev + 1) % bannersLength);
        }
      }, 5000);
    }
  }, [goToNextSlide, goToPrevSlide, bannersLength]);

  // Pause/resume timer on hover
  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (bannersLength > 1 && isComponentMounted.current) {
      timerRef.current = setInterval(() => {
        if (isComponentMounted.current) {
          setCurrentSlide((prev) => (prev + 1) % bannersLength);
        }
      }, 5000);
    }
  }, [bannersLength]);

  // Loading state
  if (isLoading || bannersLength === 0) {
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-gray-200 rounded-lg animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full mb-6 group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden relative rounded-lg aspect-[16/9]">
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            width: `${bannersLength * 100}%`
          }}
        >
          {banners.map((banner, index) => (
            <div 
              key={banner.id || index} // Use banner.id if available
              className="w-full flex-shrink-0"
              style={{ width: `${100 / bannersLength}%` }}
            >
              <BannerCard banner={banner} />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {bannersLength > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goToNextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Navigation dots */}
      {bannersLength > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
