import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/ui/Button';
import { getProperties } from '../data/properties';
import { Property, PropertyFilter } from '../types/property';

const PropertiesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PropertyFilter>({
    minPrice: undefined,
    maxPrice: undefined,
    minBeds: undefined,
    minBaths: undefined,
    propertyType: undefined,
    query: searchParams.get('query') || undefined
  });

  useEffect(() => {
    const query = searchParams.get('query');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const beds = searchParams.get('beds');
    const baths = searchParams.get('baths');

    const newFilters: PropertyFilter = {
      query: query || undefined,
      propertyType: type || undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      minBeds: beds ? parseInt(beds) : undefined,
      minBaths: baths ? parseInt(baths) : undefined
    };

    setFilters(newFilters);
    const filteredProperties = getProperties(newFilters);
    setProperties(filteredProperties);
  }, [searchParams]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : name.includes('Price') ? parseInt(value) : value
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    window.location.search = params.toString();
  };

  return (
    <div>
      <Hero
        title="Find Your Dream Property"
        subtitle="Browse our extensive collection of exceptional properties"
        imageUrl="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg"
        showSearch={true}
      />

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {properties.length} Properties Available
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal size={18} />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={filters.propertyType || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Any Type</option>
                    <option value="single-family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi-family">Multi-Family</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beds
                    </label>
                    <select
                      name="minBeds"
                      value={filters.minBeds || ''}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Baths
                    </label>
                    <select
                      name="minBaths"
                      value={filters.minBaths || ''}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={applyFilters} className="flex items-center gap-2">
                  <Filter size={18} />
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No properties found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {properties.map((property, index) => (
                <div key={property.id} className="h-full">
                  <PropertyCard 
                    property={property} 
                    priority={index < 6} // Prioritize first 6 images for above-the-fold content
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;