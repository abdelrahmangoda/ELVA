// components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 h-18 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'
      } border-b border-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
        
        {/* Logo + Tagline */}
        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-4">
            <img
                src="/src/Assests/Logo.png" 
                alt="ELVA Logo"
                className="w-40 h-auto"
            />
        </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-gray-700 hover:text-primary transition-colors">
              Login
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-semibold">
              Sign Up Free
            </button>
          </div>

          </div>
              </div>
            </nav>
          );
        }

        export default Navbar;
