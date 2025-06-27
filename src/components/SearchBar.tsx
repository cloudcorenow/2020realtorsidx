import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Button from './ui/Button';

interface SearchBarProps {
  onSearch: (filters: any) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = '' }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters = {
      query: searchParams.query,
      propertyType: searchParams.propertyType || undefined,
      minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
      minBeds: searchParams.beds ? parseInt(searchParams.beds) : undefined,
      minBaths: searchParams.baths ? parseInt(searchParams.baths) : undefined
    };
    
    onSearch(filters);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-5 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="query"
              placeholder="Search by location, property name, or keyword..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              value={searchParams.query}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Button type="submit" variant="primary" size="lg">
              Search
            </Button>
          </div>
        </div>
        
        <div className="mt-3">
          <button
            type="button"
            className="text-blue-900 font-medium flex items-center text-sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            Advanced Search
            <ChevronDown 
              size={16} 
              className={`ml-1 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isAdvancedOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  name="propertyType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                  value={searchParams.propertyType}
                  onChange={handleInputChange}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                    value={searchParams.minPrice}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                    value={searchParams.maxPrice}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  name="beds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                  value={searchParams.beds}
                  onChange={handleInputChange}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <select
                  name="baths"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
                  value={searchParams.baths}
                  onChange={handleInputChange}
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
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;