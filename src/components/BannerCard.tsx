import React from 'react';
import { Link } from 'react-router-dom';

interface BannerCardProps {
  banner: {
    id: string;
    title: string;
    subtitle?: string;
    image: string;
    link: string;
  };
}

const BannerCard = ({ banner }: BannerCardProps) => {
  return (
    <Link 
      to={banner.link}
      className="block relative overflow-hidden rounded-lg aspect-[21/9] group transition-transform duration-300"
    >
      <img 
        src={banner.image} 
        alt={banner.title}
        className="w-full h-full object-cover"
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent " />
      
      {/* Text content positioned at bottom left side */}
      <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full md:w-2/3 opacity-800">
        <h2 className="text-white font-semibold text-sm text-shadow-sm opacity-800
md:text-2l lg:text-3xl leading-tight mb-1">
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p className="text-white/100 opacity-800 text-xs md:text-base leading-relaxed">
            {banner.subtitle}
          </p>
        )}
        <div className="mt-2 md:mt-4">
        </div>
      </div>
    </Link>
  );
};

export default BannerCard;
