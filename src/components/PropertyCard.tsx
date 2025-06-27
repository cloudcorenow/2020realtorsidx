import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/Card';
import Badge from './ui/Badge';
import LazyImage from './LazyImage';
import { Property } from '../types/property';
import { formatPrice } from '../utils/formatting';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  priority?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = memo(({ 
  property, 
  isFavorite = false,
  onToggleFavorite,
  priority = false
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleFavorite) {
      onToggleFavorite(property.id);
    }
  };

  return (
    <Card className="h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group will-change-transform overflow-hidden">
      <div className="relative">
        <Link to={`/properties/${property.id}`}>
          {/* Standardized image container with 4:3 aspect ratio */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 rounded-t-lg">
            <LazyImage 
              src={property.images[0]} 
              alt={property.title}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              priority={priority}
            />
            {/* Gradient overlay for better badge visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Status badges positioned consistently */}
          <div className="absolute bottom-4 left-4 flex gap-2 z-10">
            {property.isNew && (
              <Badge variant="primary" className="animate-pulse shadow-lg backdrop-blur-sm bg-blue-600/90 text-white border-0">
                New
              </Badge>
            )}
            <Badge 
              variant={property.status === 'for-sale' ? 'secondary' : 'success'}
              className="shadow-lg backdrop-blur-sm border-0"
              style={{
                backgroundColor: property.status === 'for-sale' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(34, 197, 94, 0.9)',
                color: 'white'
              }}
            >
              {property.status === 'for-sale' ? 'For Sale' : 
               property.status === 'for-rent' ? 'For Rent' : 
               property.status === 'pending' ? 'Pending' : 'Sold'}
            </Badge>
          </div>
        </Link>
        
        {/* Heart button positioned consistently */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group z-10 border border-white/20"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            size={18} 
            className={`transition-colors duration-300 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 group-hover:text-red-500"
            }`}
          />
        </button>
      </div>
      
      {/* Content section with consistent padding and spacing */}
      <CardContent className="pt-6 pb-4 px-6">
        {/* Location with consistent spacing */}
        <div className="mb-3 flex items-center text-gray-600 text-sm">
          <MapPin size={16} className="mr-2 flex-shrink-0 text-gray-400" />
          <span className="truncate font-medium">{property.city}, {property.state}</span>
        </div>
        
        {/* Title with consistent height to prevent layout shifts */}
        <Link to={`/properties/${property.id}`} className="block">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-2 min-h-[3.5rem] leading-tight">
            {property.title}
          </h3>
        </Link>
        
        {/* Price with consistent styling */}
        <p className="text-2xl font-bold text-blue-900 mb-2">{formatPrice(property.price)}</p>
      </CardContent>
      
      {/* Footer with consistent grid layout */}
      <CardFooter className="py-4 px-6 text-sm text-gray-600 border-t border-gray-100 bg-gray-50/50 mt-auto">
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="flex items-center justify-center text-center">
            <Bed size={16} className="mr-2 flex-shrink-0 text-gray-400" />
            <span className="truncate font-medium">{property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center justify-center border-x border-gray-200 px-2 text-center">
            <Bath size={16} className="mr-2 flex-shrink-0 text-gray-400" />
            <span className="truncate font-medium">{property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          <div className="flex items-center justify-center text-center">
            <Square size={16} className="mr-2 flex-shrink-0 text-gray-400" />
            <span className="truncate font-medium">{property.sqft.toLocaleString()} ft²</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;