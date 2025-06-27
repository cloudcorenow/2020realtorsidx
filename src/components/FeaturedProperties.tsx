import React, { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import Button from './ui/Button';
import { Property } from '../types/property';

interface FeaturedPropertiesProps {
  properties: Property[];
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewMore?: boolean;
}

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = memo(({
  properties,
  title = "Featured Properties",
  subtitle = "Discover our handpicked selection of exclusive properties",
  limit = 3,
  showViewMore = true
}) => {
  const displayProperties = limit ? properties.slice(0, limit) : properties;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No properties found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {displayProperties.map((property, index) => (
                <div key={property.id} className="h-full">
                  <PropertyCard 
                    property={property} 
                    priority={index < 3} // Prioritize first 3 images
                  />
                </div>
              ))}
            </div>

            {showViewMore && properties.length > limit && (
              <div className="text-center mt-12">
                <Link to="/properties">
                  <Button variant="outline" size="lg" className="group">
                    View All Properties
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
});

FeaturedProperties.displayName = 'FeaturedProperties';

export default FeaturedProperties;