import React from 'react';
import { useQuery } from '@tanstack/react-query';
import BannerCard from './BannerCard';
import { getBanners } from '@/services/bannerService';

const BannerCarousel = () => {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-gray-200 rounded-lg animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full mb-6 aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  if (banners.length === 1) {
    return (
      <div className="w-full mb-6 rounded-lg aspect-[16/9]">
        <BannerCard banner={banners[0]} />
      </div>
    );
  }

  return (
    <div className="w-full mb-6 space-y-4">
      {banners.map((banner) => {
        const bannerKey = banner.id || banner.title || Math.random().toString();
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
