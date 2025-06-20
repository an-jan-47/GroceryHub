
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBanners } from '@/services/bannerService';
import BannerCard from './BannerCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BannerCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Fetch banners from database
  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners
  });

  // Auto-scroll banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  // Handle manual navigation
  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? banners.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % banners.length);
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left, go to next
        goToNext();
      } else {
        // Swipe right, go to previous
        goToPrevious();
      }
    }
    
    touchStartX.current = null;
  };

  // If no banners, return empty div
  if (banners.length === 0) {
    return <div className="h-48 bg-gray-100 rounded-lg animate-pulse mb-6"></div>;
  }

  return (
    <div className="mb-6 relative">
      <div 
        ref={carouselRef}
        className="relative overflow-hidden rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full flex-shrink-0">
              <BannerCard banner={banner} />
            </div>
          ))}
        </div>
        
        {/* Navigation dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${index === activeIndex ? 'bg-white w-4' : 'bg-white/50'}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-1"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-1"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BannerCarousel;
