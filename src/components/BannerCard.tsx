
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
      className="block relative overflow-hidden rounded-lg aspect-[16/9] group transition-transform duration-300 hover:scale-[1.02]"
    >
      <img 
        src={banner.image} 
        alt={banner.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      
      {/* Text content positioned at left side */}
      <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8">
        <div className="backdrop-blur-sm bg-black/30 rounded-lg p-4 max-w-md">
          <h2 className="text-white font-bold text-xl md:text-2xl lg:text-3xl leading-tight mb-2">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              {banner.subtitle}
            </p>
          )}
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/30">
              Shop Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BannerCard;
