import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Bed, Bath, Square, MapPin, Calendar, Hash, 
  Heart, Share2, Printer, ChevronLeft, ChevronRight,
  Phone, Mail, ArrowLeft, Grid3X3, Home, Car, 
  TreePine, Flame, Zap, Droplets, Wind, Shield
} from 'lucide-react';
import { getPropertyById, getRelatedProperties } from '../data/properties';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LazyImage from '../components/LazyImage';
import PropertyCard from '../components/PropertyCard';
import AgentAvatar from '../components/AgentAvatar';
import { formatPrice, formatDate, formatPropertyType } from '../utils/formatting';

const PropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  
  const property = getPropertyById(id || '');
  const relatedProperties = property ? getRelatedProperties(property, 3) : [];
  
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <Link to="/properties">
            <Button variant="outline">Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href,
      });
    } catch (error) {
      console.log('Sharing failed', error);
    }
  };

  const openPhotoGallery = (imageIndex: number = 0) => {
    setCurrentImageIndex(imageIndex);
    setShowAllPhotos(true);
  };

  // Calculate additional property details
  const lotSizeAcres = (property.sqft * 1.2 / 43560).toFixed(3); // Estimated lot size
  const pricePerSqft = Math.round(property.price / property.sqft);
  const yearsSinceBuilt = new Date().getFullYear() - property.yearBuilt;
  const fullBaths = Math.floor(property.baths);
  const halfBaths = property.baths % 1 === 0.5 ? 1 : 0;

  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 bg-black z-50 pt-20">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between py-4 text-white">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="flex items-center text-white hover:text-gray-300"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to listing
            </button>
            <span className="text-lg">
              {currentImageIndex + 1} / {property.images.length}
            </span>
          </div>
          
          <div className="relative h-[calc(100vh-140px)] flex items-center justify-center">
            <LazyImage
              src={property.images[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-4">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex ? 'border-white' : 'border-transparent opacity-60'
                }`}
              >
                <LazyImage
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Back to search */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Link 
            to="/properties" 
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to search
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery - Left Side with standardized 4:3 aspect ratio */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              {/* Main Image - Standardized 4:3 aspect ratio */}
              <div className="col-span-2 md:col-span-1 relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group bg-gray-100">
                <LazyImage
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={true}
                />
                <div 
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"
                  onClick={() => openPhotoGallery(0)}
                />
              </div>
              
              {/* Secondary Images - Standardized 4:3 aspect ratio */}
              <div className="hidden md:grid grid-rows-2 gap-3">
                {property.images.slice(1, 3).map((image, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group bg-gray-100"
                    onClick={() => openPhotoGallery(index + 1)}
                  >
                    <LazyImage
                      src={image}
                      alt={`${property.title} - Image ${index + 2}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </div>
                ))}
                
                {/* See all photos button - Standardized 4:3 aspect ratio */}
                {property.images.length > 3 && (
                  <button
                    onClick={() => openPhotoGallery(3)}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-900/80 flex items-center justify-center text-white hover:bg-gray-900/90 transition-all group"
                  >
                    <div className="absolute inset-0">
                      {property.images[3] && (
                        <LazyImage
                          src={property.images[3]}
                          alt={`${property.title} - Image 4`}
                          className="w-full h-full object-cover opacity-50"
                        />
                      )}
                    </div>
                    <div className="relative z-10 flex items-center">
                      <Grid3X3 size={20} className="mr-2" />
                      <span className="font-medium">See all {property.images.length} photos</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile see all photos button */}
            <div className="md:hidden mt-4">
              <button
                onClick={() => openPhotoGallery(0)}
                className="w-full py-3 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-all"
              >
                <Grid3X3 size={20} className="mr-2" />
                <span className="font-medium">See all {property.images.length} photos</span>
              </button>
            </div>
          </div>

          {/* Property Details - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              {/* Price and Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={property.status === 'for-sale' ? 'secondary' : 'success'}>
                    {property.status === 'for-sale' ? 'For Sale' : 
                     property.status === 'for-rent' ? 'For Rent' : 
                     property.status === 'pending' ? 'Pending' : 'Sold'}
                  </Badge>
                  {property.isNew && (
                    <Badge variant="primary">New</Badge>
                  )}
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  {formatPrice(property.price)}
                </div>
                
                <div className="flex items-start text-gray-600 mb-4">
                  <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                  <span className="text-base leading-relaxed">
                    {property.address}, {property.city}, {property.state} {property.zip}
                  </span>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{property.beds}</div>
                  <div className="text-xs text-gray-600">beds</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-xl font-bold text-gray-900">{property.baths}</div>
                  <div className="text-xs text-gray-600">baths</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{property.sqft.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">sqft</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button className="w-full" size="lg">
                  Request a tour
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Contact agent
                </Button>
              </div>

              {/* Property Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Property Type</span>
                  <span className="font-medium text-sm">{formatPropertyType(property.propertyType)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Year Built</span>
                  <span className="font-medium text-sm">{property.yearBuilt}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Lot Size</span>
                  <span className="font-medium text-sm">{lotSizeAcres} acres</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Price/sqft</span>
                  <span className="font-medium text-sm">${pricePerSqft}/sqft</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">MLS #</span>
                  <span className="font-medium text-sm">{property.mlsNumber}</span>
                </div>
              </div>

              {/* Agent Info */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <AgentAvatar
                    name={property.agent.name}
                    photo={property.agent.photo}
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-base">{property.agent.name}</h3>
                    <p className="text-gray-600 text-sm">Listing Agent</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Phone size={14} className="mr-2" />
                    {property.agent.phone}
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Mail size={14} className="mr-2" />
                    {property.agent.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About this home</h2>
          <div className="prose prose-lg text-gray-700 mb-8">
            <p className="whitespace-pre-line leading-relaxed">{property.description}</p>
          </div>
        </div>

        {/* Facts & Features Section */}
        <div className="mt-12 max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Facts & features</h2>
          
          {/* Interior Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Home className="mr-3 text-blue-600" size={20} />
              Interior
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Bedrooms & Bathrooms */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Bedrooms & bathrooms</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="font-medium">{property.beds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="font-medium">{property.baths}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Full bathrooms:</span>
                    <span className="font-medium">{fullBaths}</span>
                  </div>
                  {halfBaths > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Half bathrooms:</span>
                      <span className="font-medium">{halfBaths}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Features</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Basement:</span>
                    <span className="font-medium">
                      {property.features.some(f => f.toLowerCase().includes('basement')) ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Has fireplace:</span>
                    <span className="font-medium">
                      {property.features.some(f => f.toLowerCase().includes('fireplace')) ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Flooring:</span>
                    <span className="font-medium">
                      {property.features.find(f => f.toLowerCase().includes('floor')) || 'Mixed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interior Area */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Interior area</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Living area:</span>
                  <span className="font-medium">{property.sqft.toLocaleString()} sq ft</span>
                </div>
              </div>
            </div>
          </div>

          {/* Property Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="mr-3 text-blue-600" size={20} />
              Property
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Parking */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Parking</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total spaces:</span>
                    <span className="font-medium">
                      {property.features.find(f => f.includes('Car')) ? 
                        property.features.find(f => f.includes('Car'))?.charAt(0) : '2'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Garage spaces:</span>
                    <span className="font-medium">
                      {property.features.find(f => f.includes('Car')) ? 
                        property.features.find(f => f.includes('Car'))?.charAt(0) : '2'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lot */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Lot</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{(property.sqft * 1.2).toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Acres:</span>
                    <span className="font-medium">{lotSizeAcres}</span>
                  </div>
                </div>
              </div>

              {/* Construction */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Construction</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Year built:</span>
                    <span className="font-medium">{property.yearBuilt}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Property age:</span>
                    <span className="font-medium">{yearsSinceBuilt} Years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 max-w-4xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">What's special</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {property.features.map((feature, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Similar homes you might like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {relatedProperties.map(relatedProperty => (
                <div key={relatedProperty.id} className="h-full">
                  <PropertyCard property={relatedProperty} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPage;