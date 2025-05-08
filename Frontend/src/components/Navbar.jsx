import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, Search, Bookmark, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import { getBookmarkCount } from '../services/bookmarkService';
import { searchBooks } from '../services/bookService';

function Navbar() {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 1) {
      try {
        const results = await searchBooks(query);
        setSearchResults(results.slice(0, 5)); // Limit to 5 results
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching books:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  // Handle clicking on a search result
  const handleResultClick = (bookId) => {
    navigate(`/book/${bookId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if user is admin and update showNavbar state
  useEffect(() => {
    if (isAuthenticated() && hasRole('Admin')) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
  }, [isAuthenticated, hasRole]);

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

  // If we shouldn't show the navbar, return null but after all hooks have been called
  if (!showNavbar) {
    return null;
  }

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
            <Link to="/about" className="text-xs font-medium text-navy hover:text-gold transition-colors">About</Link>
            <Link to="/categories" className="text-xs font-medium text-navy hover:text-gold transition-colors">Categories</Link>
            <Link to="/contact" className="text-xs font-medium text-navy hover:text-gold transition-colors">Contact</Link>
          </div>
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Search */}
          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center">
                <input 
                  type="search" 
                  placeholder="Search books..." 
                  className="w-40 text-xs py-1 px-2 pl-7 border border-gray rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                />
                <Search className="absolute left-2 h-3 w-3 text-gray" />
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute mt-1 w-64 bg-white border border-gray rounded-md shadow-lg z-20">
                <ul className="py-1">
                  {searchResults.map(book => (
                    <li key={book.id} className="px-2 py-1 hover:bg-beige cursor-pointer">
                      <div 
                        onClick={() => handleResultClick(book.id)}
                        className="flex items-center gap-2"
                      >
                        <div className="w-8 h-12 bg-gray-100 flex-shrink-0">
                          <img 
                            src={book.imageUrl || `https://placehold.co/32x48?text=${encodeURIComponent(book.title?.charAt(0) || 'B')}`} 
                            alt={book.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-navy truncate">{book.title}</p>
                          <p className="text-xs text-gray truncate">{book.authors?.join(', ') || 'Unknown Author'}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                  <li className="border-t border-gray px-2 py-1">
                    <Link 
                      to={`/books?search=${encodeURIComponent(searchQuery)}`}
                      className="text-xs text-gold hover:underline block text-center"
                      onClick={() => setShowSearchResults(false)}
                    >
                      View all results
                    </Link>
                  </li>
                </ul>
              </div>
            )}
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