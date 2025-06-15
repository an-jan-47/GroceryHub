import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BannerCard from './BannerCard';
import { getBanners } from '@/services/bannerService';

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);
  
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const totalBanners = banners.length;

  // Navigation functions
  const goToNextSlide = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentSlide(prev => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const goToPrevSlide = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentSlide(prev => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalBanners) {
      setCurrentSlide(index);
    }
  }, [totalBanners]);

  // Auto-advance functionality
  const startAutoAdvance = useCallback(() => {
    if (intervalRef.current || totalBanners <= 1 || isPausedRef.current) {
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentSlide(prev => (prev + 1) % totalBanners);
      }
    }, 5000);
  }, [totalBanners]);

  const stopAutoAdvance = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start auto-advance when component mounts or banners change
  useEffect(() => {
    stopAutoAdvance();
    if (totalBanners > 1) {
      startAutoAdvance();
    }

    return stopAutoAdvance;
  }, [totalBanners, startAutoAdvance, stopAutoAdvance]);

  // Reset current slide if it's out of bounds
  useEffect(() => {
    if (currentSlide >= totalBanners && totalBanners > 0) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalBanners]);

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

  // Pause/resume on hover
  const handleMouseEnter = useCallback(() => {
    isPausedRef.current = true;
    stopAutoAdvance();
  }, [stopAutoAdvance]);

  const handleMouseLeave = useCallback(() => {
    isPausedRef.current = false;
    if (totalBanners > 1) {
      startAutoAdvance();
    }
  }, [totalBanners, startAutoAdvance]);

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

  // Make sure currentSlide is valid
  const activeSlide = currentSlide >= totalBanners ? 0 : currentSlide;

  // DEBUG: Remove potential ref usage in .map() that can cause update depth issues
  // Security: .map() inside BannerCarousel should NOT use a ref callback or create functions each render.

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
            transform: `translateX(-${activeSlide * 100}%)`,
            width: `${totalBanners * 100}%`
          }}
        >
          {banners.map((banner, index) => (
            <div 
              key={banner.id || `banner-${index}`}
              className="w-full flex-shrink-0"
              style={{ width: `${100 / totalBanners}%` }}
              // Remove any ref callbacks here!
            >
              <BannerCard banner={banner} />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {totalBanners > 1 && (
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
      {totalBanners > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              // IMPORTANT: Do NOT create inline onClicks for navigators!
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === activeSlide ? 'bg-white' : 'bg-white/50'
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
