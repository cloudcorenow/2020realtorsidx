import React from 'react';
import { Heart, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/ui/Button';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const { favoriteProperties, loading, error, toggleFavorite, isFavorited } = useFavorites();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Heart size={64} className="mx-auto text-gray-300 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">
              Please sign in to view your favorite properties.
            </p>
            <Link to="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="text-red-500 mb-4">
              <Heart size={64} className="mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Favorites</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Heart size={32} className="text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            {favoriteProperties.length === 0 
              ? "You haven't saved any properties yet."
              : `You have ${favoriteProperties.length} favorite ${favoriteProperties.length === 1 ? 'property' : 'properties'}.`
            }
          </p>
        </div>

        {favoriteProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Home size={64} className="mx-auto text-gray-300 mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">No Favorites Yet</h2>
              <p className="text-gray-600 mb-8">
                Start browsing properties and click the heart icon to save your favorites here.
              </p>
              <Link to="/properties">
                <Button size="lg">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {favoriteProperties.map((property) => (
              <div key={property.id} className="h-full">
                <PropertyCard
                  property={property}
                  isFavorite={isFavorited(property.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {favoriteProperties.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to Take the Next Step?
              </h3>
              <p className="text-gray-600 mb-6">
                Contact our expert agents to schedule tours or get more information about your favorite properties.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg">Contact Us</Button>
                </Link>
                <Link to="/agents">
                  <Button variant="outline" size="lg">Meet Our Agents</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;