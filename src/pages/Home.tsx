
import React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import PopularProducts from '@/components/PopularProducts';
import BannersSection from '@/components/BannersSection';

const HomePage = () => {
  return (
    <div className="pb-20">
      <Header />
      
      <main>
        <HeroSection />
        <BannersSection />
        <CategoriesSection />
        <FeaturedProducts />
        <PopularProducts />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
