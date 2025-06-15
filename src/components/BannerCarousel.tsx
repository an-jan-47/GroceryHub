
import React from 'react';
import BannerCard from './BannerCard';

// Static fallback banner - NO dynamic state or API calls
const STATIC_BANNER = {
  id: 'welcome-banner',
  title: 'Welcome to Grocery Hub!',
  subtitle: 'Find the best groceries at unbeatable prices',
  image: '/placeholder.svg',
  link: '/explore',
};

const BannerCarousel = () => {
  console.log('BannerCarousel rendering - static mode');
  
  // Completely static - no hooks, no state, no API calls
  return (
    <div className="w-full mb-6 rounded-lg aspect-[16/9]">
      <BannerCard banner={STATIC_BANNER} />
    </div>
  );
};

export default BannerCarousel;
