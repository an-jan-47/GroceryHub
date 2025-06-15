
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import BannerCard from './BannerCard';
import { getBanners } from '@/services/bannerService';

// TEMP STATIC fallback banner (do NOT use setState or any unstable logic in render)
const STATIC_BANNERS = [
  {
    id: 'static-1',
    title: 'Welcome to Grocery Hub!',
    subtitle: 'Find the best groceries at unbeatable prices',
    image: '/placeholder.svg',
    link: '/explore',
  },
];

const BannerCarousel = () => {
  const { data: banners = [], isLoading, error } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Error UI
  if (error) {
    console.error("Error loading banners:", error);
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-red-100 rounded-lg flex items-center justify-center">
        <p className="text-red-700">Failed to load banners</p>
      </div>
    );
  }

  // Loading UI
  if (isLoading) {
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-gray-200 rounded-lg animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Fallback: no banners from API, show static
  if (!banners || banners.length === 0) {
    console.warn("No banners found. Showing static fallback for debug.");
    return (
      <div className="w-full mb-6 rounded-lg aspect-[16/9]">
        <BannerCard banner={STATIC_BANNERS[0]} />
      </div>
    );
  }

  // If only one banner, show single card
  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <div className="w-full mb-6 rounded-lg aspect-[16/9]">
        <BannerCard banner={banner} />
      </div>
    );
  }

  // More than one banner: render all vertically, correct keys on outer wrappers only.
  return (
    <div className="w-full mb-6 space-y-4">
      {banners.map((banner) => (
        <div key={banner.id || banner.title} className="w-full rounded-lg aspect-[16/9]">
          <BannerCard banner={banner} />
        </div>
      ))}
    </div>
  );
};

export default BannerCarousel;
