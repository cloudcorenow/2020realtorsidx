import React, { lazy, Suspense, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazyImage from './LazyImage';

const SearchBar = lazy(() => import('./SearchBar'));

interface HeroProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  showSearch?: boolean;
}

const Hero: React.FC<HeroProps> = memo(({ 
  title = "Find Your Perfect Home", 
  subtitle = "Discover exceptional properties with 20/20 Realtors", 
  imageUrl = "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
  showSearch = true
}) => {
  const navigate = useNavigate();
  
  const handleSearch = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.propertyType) params.append('type', filters.propertyType);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minBeds) params.append('beds', filters.minBeds.toString());
    if (filters.minBaths) params.append('baths', filters.minBaths.toString());
    
    navigate(`/properties?${params.toString()}`);
  };

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 80,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative h-[90vh] min-h-[600px] max-h-[900px] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <LazyImage
          src={imageUrl}
          alt="Hero background"
          className="w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight font-serif animate-fade-in">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up">
            {subtitle}
          </p>

          {showSearch && (
            <div className="w-full max-w-4xl mt-8 animate-fade-in-up delay-200">
              <Suspense fallback={<div className="h-20 bg-white/20 rounded-lg animate-pulse" />}>
                <SearchBar 
                  onSearch={handleSearch} 
                  className="bg-white/95 backdrop-blur-lg shadow-xl border-0"
                />
              </Suspense>
            </div>
          )}
        </div>

        <button 
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white hover:text-amber-300 transition-all duration-300 animate-bounce"
          aria-label="Scroll down"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-medium">Explore</span>
            <ChevronDown size={24} />
          </div>
        </button>
      </div>
    </div>
  );
});

Hero.displayName = 'Hero';

export default Hero;