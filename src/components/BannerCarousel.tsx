import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BannerCard from './BannerCard';
import { getBanners } from '@/services/bannerService';

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Refs for touch handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Ref for auto-advance interval
  const intervalRef = useRef(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const totalBanners = banners.length;

  // Memoized navigation functions
  const goToNextSlide = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentSlide(prev => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const goToPrevSlide = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentSlide(prev => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < totalBanners) {
      setCurrentSlide(index);
    }
  }, [totalBanners]);

  // Auto-advance effect - simplified and isolated
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start auto-advance if we have multiple banners and auto-play is enabled
    if (totalBanners > 1 && isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalBanners);
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [totalBanners, isAutoPlaying]);

  // Reset slide if it's out of bounds - separate effect
  useEffect(() => {
    if (currentSlide >= totalBanners && totalBanners > 0) {
      setCurrentSlide(0);
    }
  }, [totalBanners]); // Only depend on totalBanners, not currentSlide

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
  }, [goToNextSlide, goToPrevSlide]);

  // Mouse event handlers for pause/resume
  const handleMouseEnter = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsAutoPlaying(true);
  }, []);

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
  if (totalBanners === 0) {
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  // Ensure currentSlide is within bounds
  const safeCurrentSlide = Math.min(currentSlide, totalBanners - 1);

  return (
    <div
      className="relative w-full mb-6 group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main carousel container */}
      <div className="overflow-hidden relative rounded-lg aspect-[16/9]">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${safeCurrentSlide * 100}%)`,
            width: `${totalBanners * 100}%`
          }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id || `banner-${index}`}
              className="w-full flex-shrink-0"
              style={{ width: `${100 / totalBanners}%` }}
            >
              <BannerCard banner={banner} />
            </div>
          ))}
        </div>

        {/* Navigation arrows - only show if multiple banners */}
        {totalBanners > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goToNextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Navigation dots - only show if multiple banners */}
      {totalBanners > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              className={`w-2 h-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
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
