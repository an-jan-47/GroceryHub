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
  const prevBannersLength = useRef(0);
  
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const bannersLength = banners.length;
  
  // Safe navigation functions that won't cause infinite loops
  const goToNextSlide = useCallback(() => {
    if (bannersLength <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % bannersLength);
  }, [bannersLength]);

  const goToPrevSlide = useCallback(() => {
    if (bannersLength <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + bannersLength) % bannersLength);
  }, [bannersLength]);

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= bannersLength || index === currentSlide) return;
    setCurrentSlide(index);
  }, [bannersLength, currentSlide]);

  // Handle banner length changes safely
  useEffect(() => {
    if (bannersLength !== prevBannersLength.current) {
      prevBannersLength.current = bannersLength;
      
      // Only reset if current slide is out of bounds
      if (bannersLength > 0 && currentSlide >= bannersLength) {
        setCurrentSlide(0);
      }
    }
  }, [bannersLength, currentSlide]);

  // Auto-advance timer - simplified version
  useEffect(() => {
    if (bannersLength <= 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Create new timer
    timerRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannersLength);
    }, 5000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [bannersLength]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
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
  }, [goToNextSlide, goToPrevSlide]);

  // Pause timer on mouse enter
  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Resume timer on mouse leave
  const handleMouseLeave = useCallback(() => {
    if (bannersLength > 1) {
      timerRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % bannersLength);
      }, 5000);
    }
  }, [bannersLength]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-gray-200 rounded-lg animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // No banners state
  if (bannersLength === 0) {
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  // Ensure currentSlide is within bounds before rendering
  const safeCurrentSlide = Math.min(currentSlide, bannersLength - 1);

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
            transform: `translateX(-${safeCurrentSlide * 100}%)`,
            width: `${bannersLength * 100}%`
          }}
        >
          {banners.map((banner, index) => (
            <div 
              key={banner.id || `banner-${index}`}
              className="w-full flex-shrink-0"
              style={{ width: `${100 / bannersLength}%` }}
            >
              <BannerCard banner={banner} />
            </div>
          ))}
        </div>

        {/* Navigation arrows - only show if more than 1 banner */}
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

      {/* Navigation dots - only show if more than 1 banner */}
      {bannersLength > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === safeCurrentSlide ? 'bg-white' : 'bg-white/50'
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
