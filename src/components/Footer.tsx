import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <img 
                src="/logo-2020-realtors-new.png" 
                alt="20/20 Realtors" 
                className="h-16 w-auto"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('h3');
                  fallback.className = 'text-2xl font-serif font-bold text-blue-900';
                  fallback.textContent = '20/20 Realtors';
                  target.parentNode?.insertBefore(fallback, target);
                }}
              />
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted partner in real estate, providing exceptional service and expertise.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-300 hover:text-white transition-colors">Properties</Link>
              </li>
              <li>
                <Link to="/agents" className="text-gray-300 hover:text-white transition-colors">Agents</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          {/* Property Types */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Property Types</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/properties?type=single-family" className="text-gray-300 hover:text-white transition-colors">
                  Single Family Homes
                </Link>
              </li>
              <li>
                <Link to="/properties?type=condo" className="text-gray-300 hover:text-white transition-colors">
                  Condominiums
                </Link>
              </li>
              <li>
                <Link to="/properties?type=townhouse" className="text-gray-300 hover:text-white transition-colors">
                  Townhouses
                </Link>
              </li>
              <li>
                <Link to="/properties?type=multi-family" className="text-gray-300 hover:text-white transition-colors">
                  Multi-Family
                </Link>
              </li>
              <li>
                <Link to="/properties?type=land" className="text-gray-300 hover:text-white transition-colors">
                  Land & Lots
                </Link>
              </li>
              <li>
                <Link to="/properties?type=commercial" className="text-gray-300 hover:text-white transition-colors">
                  Commercial
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="text-amber-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300">
                  2677 N. Main St #465<br />
                  Santa Ana, CA
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-amber-500 mr-3 flex-shrink-0" />
                <a href="tel:(714) 470-4444" className="text-gray-300 hover:text-white transition-colors">
                  (714) 470-4444
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-amber-500 mr-3 flex-shrink-0" />
                <a href="mailto:info@2020realtors.com" className="text-gray-300 hover:text-white transition-colors">
                  info@2020realtors.com
                </a>
              </li>
            </ul>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2">Office Hours</h5>
              <p className="text-gray-300">Monday - Friday: 9am - 5pm</p>
              <p className="text-gray-300">Saturday: By Appointment</p>
              <p className="text-gray-300">Sunday: By Appointment</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} 20/20 Realtors. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;