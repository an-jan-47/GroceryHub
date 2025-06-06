
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BannerCard from './BannerCard';
import { getBanners } from '@/services/bannerService';

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Auto-advance slides
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[16/9] bg-gray-200 animate-pulse rounded-lg mb-6"></div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full mb-6">
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full flex-shrink-0">
              <BannerCard banner={banner} />
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;
