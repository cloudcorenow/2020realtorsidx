import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, Users, Phone, Heart, LogOut, User } from 'lucide-react';
import Button from './ui/Button';
import AuthModal from './auth/AuthModal';
import { getCurrentUser } from '../services/authService';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<any | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Properties', path: '/properties', icon: <Search size={18} /> },
    { name: 'Agents', path: '/agents', icon: <Users size={18} /> },
    { name: 'Contact', path: '/contact', icon: <Phone size={18} /> },
    { name: 'Favorites', path: '/favorites', icon: <Heart size={18} /> },
  ];
  
  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isHomePage && !isScrolled 
      ? 'bg-transparent text-white'
      : 'bg-white text-gray-900 shadow-sm'
  }`;
  
  const navLinkClasses = `group inline-flex items-center px-4 py-2 font-medium transition-colors rounded-md ${
    isHomePage && !isScrolled
      ? 'text-white/90 hover:text-white hover:bg-white/10'
      : 'text-gray-700 hover:text-blue-900 hover:bg-gray-100'
  }`;
  
  const activeNavLinkClasses = `${navLinkClasses} ${
    isHomePage && !isScrolled
      ? 'bg-white/20 text-white'
      : 'bg-gray-100 text-blue-900'
  }`;

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    setUser(null);
    setIsUserMenuOpen(false);
  };
  
  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo-2020-realtors-new.png" 
              alt="20/20 Realtors" 
              className="h-12 w-auto"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('span');
                fallback.className = `text-2xl font-serif font-bold ${
                  isHomePage && !isScrolled ? 'text-blue-900' : 'text-blue-900'
                }`;
                fallback.textContent = '20/20 Realtors';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={location.pathname === link.path ? activeNavLinkClasses : navLinkClasses}
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}
          </nav>
          
          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <User size={18} />
                  <span>{user.email}</span>
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Favorites
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleAuthClick('signin')}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => handleAuthClick('signup')}
                >
                  Register
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={24} className={isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} />
            ) : (
              <Menu size={24} className={isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md ${
                    location.pathname === link.path
                      ? 'bg-gray-100 text-blue-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-900'
                  }`}
                >
                  {link.icon}
                  <span className="ml-2">{link.name}</span>
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center space-x-3 mt-5 pt-5 border-t border-gray-200">
              {user ? (
                <Button 
                  fullWidth 
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex items-center justify-center space-x-2"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={() => handleAuthClick('signin')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    fullWidth 
                    onClick={() => handleAuthClick('signup')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </header>
  );
};

export default Header;