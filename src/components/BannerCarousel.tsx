
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import BannerCard from './BannerCard';
import { getBanners } from '@/services/bannerService';

// TEMP STATIC BANNER for troubleshooting (delete after fix)
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

  // Log current path in render cycle
  console.log('Rendering BannerCarousel...');
  if (error) {
    console.error("Error loading banners:", error);
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-red-100 rounded-lg flex items-center justify-center">
        <p className="text-red-700">Failed to load banners</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-gray-200 rounded-lg animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Fallback: If there are no banners, render a static banner for isolation
  if (!banners || banners.length === 0) {
    console.warn("No banners found. Showing static fallback for debug.");
    return (
      <div className="w-full mb-6 rounded-lg aspect-[16/9]">
        <BannerCard banner={STATIC_BANNERS[0]} />
      </div>
    );
  }

  // Debug: Log banner keys
  banners.forEach((banner, idx) => {
    const keyValue = banner.id || banner.title || idx;
    console.log(`Banner ${idx} key:`, keyValue, "Banner:", banner);
  });

  if (banners.length === 1) {
    const keyValue = banners[0].id || banners[0].title || 0;
    return (
      <div className="w-full mb-6 rounded-lg aspect-[16/9]">
        <BannerCard key={keyValue} banner={banners[0]} />
      </div>
    );
  }

  // Use banner.id, or if missing, banner.title, or index (last resort)
  return (
    <div className="w-full mb-6 space-y-4">
      {banners.map((banner, idx) => {
        const bannerKey = banner.id || banner.title || idx; // index is worst fallback, but prevents remount storm if necessary
        return (
          <div key={bannerKey} className="w-full rounded-lg aspect-[16/9]">
            <BannerCard banner={banner} />
          </div>
        );
      })}
    </div>
  );
};

export default BannerCarousel;

