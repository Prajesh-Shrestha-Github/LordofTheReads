import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, Search } from 'lucide-react';

function Navbar() {
  const [cartItemCount, setCartItemCount] = useState(0);

  // Update cart count whenever localStorage changes
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(itemCount);
      } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        setCartItemCount(0);
      }
    };

    // Initial count
    updateCartCount();

    // Listen for storage events (when localStorage changes)
    window.addEventListener('storage', updateCartCount);

    // Custom event for cart updates from within the same window
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

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
          
          {/* Cart */}
          <Link to="/cart" className="text-navy hover:text-gold transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          
          {/* Sign In Button */}
          <Link 
            to="/login" 
            className="bg-navy text-white text-xs px-4 py-1.5 rounded-md hover:bg-gold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;