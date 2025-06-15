
import React from 'react';
import BannerCard from './BannerCard';

const BannerCarousel = () => {
  console.log('BannerCarousel rendering - static implementation');

  // Static banner data
  const banners = [
    {
      id: '1',
      title: 'Fresh Groceries Delivered',
      subtitle: 'Get the best quality products delivered to your doorstep',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=600',
      link: '/explore'
    },
    {
      id: '2', 
      title: 'Special Offers',
      subtitle: 'Amazing deals on your favorite brands',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&h=600',
      link: '/explore?category=offers'
    },
    {
      id: '3',
      title: 'Organic Products',
      subtitle: 'Healthy choices for your family',
      image: 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?auto=format&fit=crop&w=1200&h=600',
      link: '/explore?category=organic'
    }
  ];

  return (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-lg">
        {/* Display first banner as static */}
        <BannerCard banner={banners[0]} />
      </div>
    </div>
  );
};

export default BannerCarousel;
