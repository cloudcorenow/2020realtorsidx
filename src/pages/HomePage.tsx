import React, { lazy, Suspense, useMemo } from 'react';
import { MapPin, Home as HomeIcon, Award, PenTool, Gem } from 'lucide-react';
import Hero from '../components/Hero';
import Button from '../components/ui/Button';
import { getFeaturedProperties, getNewListings } from '../data/properties';
import { getTopAgents } from '../data/agents';
import { Link } from 'react-router-dom';

// Lazy load components
const FeaturedProperties = lazy(() => import('../components/FeaturedProperties'));
const AgentCard = lazy(() => import('../components/AgentCard'));

// Loading component
const PropertySectionSkeleton = () => (
  <div className="py-16 bg-gray-50 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <div className="h-10 bg-gray-200 rounded-lg w-96 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-2/3 mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  // Memoize data to prevent unnecessary recalculations
  const featuredProperties = useMemo(() => getFeaturedProperties(), []);
  const newListings = useMemo(() => getNewListings(), []);
  const topAgents = useMemo(() => getTopAgents(3), []);
  
  return (
    <div>
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Properties */}
      <Suspense fallback={<PropertySectionSkeleton />}>
        <FeaturedProperties 
          properties={featuredProperties}
          title="Featured Properties"
          subtitle="Discover exceptional properties in Southern California's most desirable locations"
        />
      </Suspense>
      
      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-serif">
                Your Vision, Our Expertise
              </h2>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-6">
                  At 20/20 Realtors, we don't just see properties—we see possibilities. Just like perfect 20/20 vision, we bring clarity, precision, and foresight to every real estate transaction. As a trusted firm in Southern California, we combine local expertise, innovative strategies, and unwavering dedication to turn your real estate goals into reality.
                </p>
                <p className="mb-8">
                  Whether you're buying your dream home, selling for top dollar, or building an investment portfolio, we deliver personalized service, insider market knowledge, and results-driven strategies to ensure a seamless and successful experience. With years of expertise across Los Angeles, Orange County, San Diego, Riverside, and beyond, we know the nuances of each neighborhood—giving you the competitive edge in today's fast-paced market.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Why Choose 20/20 Realtors?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex">
                  <div className="mr-4 text-amber-500">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Clear Vision</h4>
                    <p className="text-gray-600">A focused, strategic approach to achieving your real estate goals</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 text-amber-500">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Local Mastery</h4>
                    <p className="text-gray-600">Deep-rooted knowledge of Southern California's ever-changing markets</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 text-amber-500">
                    <PenTool size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Tailored Service</h4>
                    <p className="text-gray-600">Custom solutions designed around your unique needs and lifestyle</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 text-amber-500">
                    <Gem size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Proven Results</h4>
                    <p className="text-gray-600">A track record of success and client satisfaction</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-8">
                We don't just meet expectations—we exceed them. Because when it comes to real estate, you deserve an agent who sees every opportunity before it's even on the horizon.
              </p>
              
              <p className="text-xl font-semibold text-blue-900 mb-8">
                Let's turn your vision into your address. 🏡
              </p>
              
              <Link to="/about">
                <Button variant="primary" size="lg">
                  Learn More About Us
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden shadow-lg h-64">
                  <img 
                    src="https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg" 
                    alt="Modern Home Exterior" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg h-48">
                  <img 
                    src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg" 
                    alt="Luxury Interior" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-lg overflow-hidden shadow-lg h-48">
                  <img 
                    src="https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg" 
                    alt="Modern Kitchen" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg h-64">
                  <img 
                    src="https://images.pexels.com/photos/1876045/pexels-photo-1876045.jpeg" 
                    alt="Luxury Pool" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* New Listings */}
      <Suspense fallback={<PropertySectionSkeleton />}>
        <FeaturedProperties 
          properties={newListings}
          title="New Listings"
          subtitle="Be the first to see these stunning new properties on the market"
        />
      </Suspense>
      
      {/* Meet Our Agents */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Agents</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our team of experienced real estate professionals is ready to assist you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Suspense fallback={
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </>
            }>
              {topAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </Suspense>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/agents">
              <Button variant="outline" size="lg">
                View All Agents
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Neighborhoods */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Areas</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore Southern California's most desirable neighborhoods
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Area Card 1 */}
            <div className="relative rounded-lg overflow-hidden h-96 group">
              <img 
                src="https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg" 
                alt="Orange County" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Orange County</h3>
                <p className="text-white/90 mb-4">
                  Premier coastal living
                </p>
                <Link to="/properties?location=orange-county">
                  <Button variant="secondary" size="sm">View Properties</Button>
                </Link>
              </div>
            </div>
            
            {/* Area Card 2 */}
            <div className="relative rounded-lg overflow-hidden h-96 group">
              <img 
                src="https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg" 
                alt="Los Angeles" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Los Angeles</h3>
                <p className="text-white/90 mb-4">
                  Urban sophistication meets lifestyle
                </p>
                <Link to="/properties?location=los-angeles">
                  <Button variant="secondary" size="sm">View Properties</Button>
                </Link>
              </div>
            </div>
            
            {/* Area Card 3 */}
            <div className="relative rounded-lg overflow-hidden h-96 group">
              <img 
                src="https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg" 
                alt="San Diego" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">San Diego</h3>
                <p className="text-white/90 mb-4">
                  Coastal charm and modern amenities
                </p>
                <Link to="/properties?location=san-diego">
                  <Button variant="secondary" size="sm">View Properties</Button>
                </Link>
              </div>
            </div>

            {/* Area Card 4 */}
            <div className="relative rounded-lg overflow-hidden h-96 group">
              <img 
                src="https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg" 
                alt="Riverside County" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Riverside County</h3>
                <p className="text-white/90 mb-4">
                  Spacious living with mountain views
                </p>
                <Link to="/properties?location=riverside">
                  <Button variant="secondary" size="sm">View Properties</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Home?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Let our expert agents guide you through Southern California's dynamic real estate market
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Contact Us
              </Button>
            </Link>
            <Link to="/properties">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;