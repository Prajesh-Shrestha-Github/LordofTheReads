import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, Search, Bookmark, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import { getBookmarkCount } from '../services/bookmarkService';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  
  const handleLogout = () => {
    logout();
    // Optionally redirect to home or login page
    window.location.href = '/';
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Update cart count from the database
  useEffect(() => {
    const fetchCartCount = async () => {
      if (isAuthenticated()) {
        try {
          const count = await cartService.getCartCount();
          setCartItemCount(count);
        } catch (error) {
          console.error('Error fetching cart count:', error);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    // Initial fetch
    fetchCartCount();

    // Set up polling to refresh cart count every 30 seconds
    const intervalId = setInterval(fetchCartCount, 30000);

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isAuthenticated]);

  // Update bookmark count from the database
  useEffect(() => {
    const fetchBookmarkCount = async () => {
      if (isAuthenticated()) {
        try {
          const count = await getBookmarkCount();
          setBookmarkCount(count);
        } catch (error) {
          console.error('Error fetching bookmark count:', error);
          setBookmarkCount(0);
        }
      } else {
        setBookmarkCount(0);
      }
    };

    // Initial fetch
    fetchBookmarkCount();

    // Set up polling to refresh bookmark count every 30 seconds
    const intervalId = setInterval(fetchBookmarkCount, 30000);

    // Also listen for bookmark updates
    const handleBookmarkUpdate = () => {
      fetchBookmarkCount();
    };

    window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate);
    };
  }, [isAuthenticated]);

  return (
    <header className="bg-white py-3 border-b border-gray">
      <div className="container mx-auto px-4 flex items-center">
        {/* Logo */}
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gold" />
            <span className="text-sm font-bold text-navy">Lord of the Reads</span>
          </Link>
        </div>

        {/* Navigation Links - Centered */}
        <nav className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xs font-medium text-navy hover:text-gold transition-colors">Home</Link>
            <Link to="/books" className="text-xs font-medium text-navy hover:text-gold transition-colors">Books</Link>
            <Link to="/categories" className="text-xs font-medium text-navy hover:text-gold transition-colors">Categories</Link>
            <Link to="/about" className="text-xs font-medium text-navy hover:text-gold transition-colors">About</Link>
            <Link to="/contact" className="text-xs font-medium text-navy hover:text-gold transition-colors">Contact</Link>
          </div>
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="relative flex items-center">
              <input 
                type="search" 
                placeholder="Search books..." 
                className="w-40 text-xs py-1 px-2 pl-7 border border-gray rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <Search className="absolute left-2 h-3 w-3 text-gray" />
            </div>
          </div>
          
          {/* Bookmarks */}
          <Link to="/bookmarks" className="text-navy hover:text-gold transition-colors relative">
            <Bookmark className="h-5 w-5" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </Link>
          
          {/* Cart */}
          <Link to="/cart" className="text-navy hover:text-gold transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated() ? (
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center gap-1 bg-navy text-white px-2 py-1 rounded-md hover:bg-gold hover:text-navy transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-xs hidden sm:inline">{user?.firstName || 'User'}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray">
                  <div className="px-4 py-2 border-b border-gray">
                    <p className="text-xs font-medium text-navy">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role !== undefined ? (['Member', 'Staff', 'Admin'][user.role]) : 'Member'}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-xs text-navy hover:bg-gray-100">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-xs text-navy hover:bg-gray-100">My Orders</Link>
                  {(user?.role === 1 || user?.role === 2) && (
                    <Link to="/admin" className="block px-4 py-2 text-xs text-navy hover:bg-gray-100">Admin Dashboard</Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-gray-100 flex items-center gap-1"
                  >
                    <LogOut className="h-3 w-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-navy text-white text-xs px-4 py-1.5 rounded-md hover:bg-gold transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;