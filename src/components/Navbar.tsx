import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Menu, X, LogOut, ShoppingCart, BookOpen } from 'lucide-react';
import LocationModal from './LocationModal';
import AuthModal from './AuthModal';
import SearchBar from './SearchBar';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { state: cartState } = useCart();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setSelectedLocation(location.address);
    localStorage.setItem('selectedLocation', location.address);
    setIsLocationModalOpen(false);
    toast.success('Location updated successfully!');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Successfully logged out!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                UC
              </Link>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="ml-4 flex items-center hover:bg-gray-100 px-2 py-1 rounded-lg hidden sm:flex"
              >
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="ml-2 text-gray-700 max-w-[200px] truncate">
                  {selectedLocation}
                </span>
              </button>
            </div>
            
            <div className="hidden sm:flex items-center flex-1 justify-end">
              <div className="mx-4 flex-1 max-w-lg">
                <SearchBar />
              </div>
              
              {user && (
                <Link
                  to="/my-bookings"
                  className="mr-4 flex items-center hover:bg-gray-100 px-2 py-1 rounded-lg"
                >
                  <BookOpen className="h-5 w-5 text-gray-700" />
                  <span className="ml-2 text-gray-700">My Bookings</span>
                </Link>
              )}

              <Link
                to="/cart"
                className="mr-4 flex items-center hover:bg-gray-100 px-2 py-1 rounded-lg relative"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartState.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartState.items.length}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{user.email}</span>
                  {user.email === 'admin@urbancompany.com' && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 text-gray-700 mr-2" />
                    <span className="text-gray-700">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <User className="h-5 w-5 text-gray-700" />
                  <span className="ml-2 text-gray-700">Login</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t">
            <div className="px-4 py-2">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center w-full py-2"
              >
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="ml-2 text-gray-700 truncate">{selectedLocation}</span>
              </button>
              
              <div className="my-2">
                <SearchBar onClose={() => setIsMobileMenuOpen(false)} />
              </div>

              {user && (
                <Link
                  to="/my-bookings"
                  className="flex items-center w-full py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="h-5 w-5 text-gray-700" />
                  <span className="ml-2 text-gray-700">My Bookings</span>
                </Link>
              )}

              <Link
                to="/cart"
                className="flex items-center w-full py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                <span className="ml-2 text-gray-700">Cart ({cartState.items.length})</span>
              </Link>
              
              {user ? (
                <>
                  <div className="py-2 text-gray-700">{user.email}</div>
                  {user.email === 'admin@urbancompany.com' && (
                    <Link
                      to="/admin"
                      className="flex items-center w-full py-2 text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full py-2"
                  >
                    <LogOut className="h-5 w-5 text-gray-700 mr-2" />
                    <span className="text-gray-700">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full py-2"
                >
                  <User className="h-5 w-5 text-gray-700" />
                  <span className="ml-2 text-gray-700">Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleLocationSelect}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;