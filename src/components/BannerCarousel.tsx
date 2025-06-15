import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BannerCard from './BannerCard';
import { getBanners } from '@/services/bannerService';

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isMountedRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (banners.length <= 1) return;
    
    timerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }
    }, 5000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [banners.length]); // Only depend on banners.length

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;

    if (Math.abs(diffX) > 50) { // Minimum swipe distance
      if (diffX > 0) {
        // Swipe left - go to next slide
        goToNextSlide();
      } else {
        // Swipe right - go to previous slide
        goToPrevSlide();
      }
    }
  };

  const goToNextSlide = () => {
    if (isMountedRef.current) {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }
  };

  const goToPrevSlide = () => {
    if (isMountedRef.current) {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const goToSlide = (index: number) => {
    if (isMountedRef.current) {
      setCurrentSlide(index);
    }
  };

  // Don't render if loading or no banners
  if (isLoading || banners.length === 0) {
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
    >
      <div className="overflow-hidden relative rounded-lg aspect-[16/9]">
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            width: `${banners.length * 100}%`
          }}
        >
          {banners.map((banner) => (
            <div 
              key={banner.id}
              className="w-full flex-shrink-0"
            >
              <BannerCard banner={banner} />
            </div>
          ))}
        </div>

        {/* Left Arrow - only show if more than 1 banner */}
        {banners.length > 1 && (
          <button
            onClick={goToPrevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow - only show if more than 1 banner */}
        {banners.length > 1 && (
          <button
            onClick={goToNextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation dots - only show if more than 1 banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
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
