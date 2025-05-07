import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, ChevronDown, Star, StarHalf, Grid, List, Bookmark, ShoppingCart } from 'lucide-react';
import { addBookmark, isBookmarked, removeBookmark } from '../services/bookmarkService';
import cartService from '../services/cartService';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Books() {
  // Books data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { isAuthenticated } = useAuth();
  const [bookmarkStates, setBookmarkStates] = useState({});
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    category: 'all',
    price: 'all',
    rating: 'all',
  });
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'fiction', name: 'Fiction' },
    { id: 'non-fiction', name: 'Non-Fiction' },
    { id: 'science-fiction', name: 'Science Fiction' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'thriller', name: 'Thriller' },
    { id: 'self-help', name: 'Self-Help' },
    { id: 'memoir', name: 'Memoir' },
  ];
  
  // Price ranges
  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: 'under-10', name: 'Under $10' },
    { id: '10-20', name: '$10 - $20' },
    { id: '20-30', name: '$20 - $30' },
    { id: 'over-30', name: 'Over $30' },
  ];
  
  // Rating options
  const ratingOptions = [
    { id: 'all', name: 'All Ratings' },
    { id: '4-up', name: '4 Stars & Up' },
    { id: '3-up', name: '3 Stars & Up' },
    { id: '2-up', name: '2 Stars & Up' },
    { id: '1-up', name: '1 Star & Up' },
  ];
  
  // Sort options
  const sortOptions = [
    { id: 'popularity', name: 'Popularity' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'newest', name: 'Newest Arrivals' },
    { id: 'rating', name: 'Average Rating' },
  ];

  // Fetch books data
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5253/api/book');
        console.log('API Response:', response.data);
        setBooks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books. Please make sure the backend server is running.');
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  // Load bookmark states when books are loaded
  useEffect(() => {
    const loadBookmarkStates = async () => {
      if (isAuthenticated() && books.length > 0) {
        const states = {};
        for (const book of books) {
          try {
            states[book.id] = await isBookmarked(book.id);
          } catch (error) {
            console.error(`Error checking bookmark state for book ${book.id}:`, error);
            states[book.id] = false;
          }
        }
        setBookmarkStates(states);
      }
    };
    
    loadBookmarkStates();
  }, [books, isAuthenticated]);

  // Handle adding to cart
  const handleAddToCart = async (book) => {
    try {
      if (!isAuthenticated()) {
        // If user is not authenticated, show notification to login
        setNotification({
          show: true,
          message: 'Please login to add items to your cart',
          type: 'login'
        });
        return;
      }

      // Add to cart using the cart service
      await cartService.addToCart(book.id, 1);
      
      // Show notification
      setNotification({
        show: true,
        message: `${book.title} added to cart!`,
        type: 'cart'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({
        show: true,
        message: 'Failed to add item to cart. Please try again.',
        type: 'error'
      });
    }
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async (book) => {
    try {
      if (!isAuthenticated()) {
        // If user is not authenticated, show notification to login
        setNotification({
          show: true,
          message: 'Please login to bookmark books',
          type: 'login'
        });
        return;
      }

      const isCurrentlyBookmarked = bookmarkStates[book.id];

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        await removeBookmark(book.id);
        setBookmarkStates(prev => ({ ...prev, [book.id]: false }));
        setNotification({
          show: true,
          message: `${book.title} removed from bookmarks!`,
          type: 'bookmark'
        });
      } else {
        // Add bookmark
        await addBookmark(book.id);
        setBookmarkStates(prev => ({ ...prev, [book.id]: true }));
        setNotification({
          show: true,
          message: `${book.title} added to bookmarks!`,
          type: 'bookmark'
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setNotification({
        show: true,
        message: 'Failed to update bookmark. Please try again.',
        type: 'error'
      });
    }
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Apply the search query when the form is submitted
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Toggle view mode between grid and list
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Filter books based on current filters and search query
  const filteredBooks = books.filter(book => {
    // Category filter
    if (filters.category !== 'all' && book.category !== filters.category) {
      return false;
    }
    
    // Price filter
    if (filters.price !== 'all') {
      if (filters.price === 'under-10' && book.price >= 10) return false;
      if (filters.price === '10-20' && (book.price < 10 || book.price >= 20)) return false;
      if (filters.price === '20-30' && (book.price < 20 || book.price >= 30)) return false;
      if (filters.price === 'over-30' && book.price < 30) return false;
    }
    
    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseInt(filters.rating.split('-')[0]);
      if (book.rating < minRating) return false;
    }
    
    // Search query
    if (appliedSearchQuery) {
      const query = appliedSearchQuery.toLowerCase();
      const titleMatch = book.title?.toLowerCase().includes(query) || false;
      const authorMatch = book.authors?.some(author => author.toLowerCase().includes(query)) || false;
      if (!titleMatch && !authorMatch) return false;
    }
    
    return true;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.publicationDate) - new Date(a.publicationDate);
    if (sortBy === 'rating') return b.rating - a.rating;
    // Default: popularity (by id for this example)
    return a.id - b.id;
  });

  // Get current books for pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen flex flex-col bg-beige">
      <Navbar />
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 bg-navy text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fade-in-up">
          <div className="flex items-center">
            <span>{notification.message}</span>
            {notification.type === 'login' ? (
              <Link to="/login" className="ml-4 text-gold hover:underline">Login</Link>
            ) : (
              <Link 
                to={notification.type === 'bookmark' || notification.message.includes('bookmark') ? "/bookmarks" : "/cart"}
                className="ml-4 text-gold hover:underline"
              >
                View {notification.type === 'bookmark' || notification.message.includes('bookmark') ? "Bookmarks" : "Cart"}
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="bg-navy text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Explore Our Collection</h1>
          <p className="text-lg">Discover thousands of books across every genre, from timeless classics to the latest bestsellers.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Filters and Books Container */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="md:w-1/4 lg:w-1/5">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="font-medium text-navy">Filters</h2>
                <button 
                  onClick={() => {
                    setFilters({ category: 'all', price: 'all', rating: 'all' });
                    setSearchQuery('');
                    setAppliedSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-gold hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={filters.category === category.id}
                        onChange={() => handleFilterChange('category', filters.category === category.id ? 'all' : category.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category.id}`} className="text-sm text-gray-600">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Price Range</h3>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="10"
                  value={filters.price === 'all' ? 50 : parseInt(filters.price.split('-')[0])}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    let priceFilter = 'all';
                    if (value === 0) priceFilter = 'under-10';
                    else if (value === 10) priceFilter = '10-20';
                    else if (value === 20) priceFilter = '20-30';
                    else if (value === 30) priceFilter = 'over-30';
                    handleFilterChange('price', priceFilter);
                  }}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>$0</span>
                  <span>$50+</span>
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Rating</h3>
                <div className="space-y-2">
                  {ratingOptions.map(option => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`rating-${option.id}`}
                        checked={filters.rating === option.id}
                        onChange={() => handleFilterChange('rating', filters.rating === option.id ? 'all' : option.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`rating-${option.id}`} className="text-sm text-gray-600 flex items-center">
                        {option.id !== 'all' && (
                          <div className="flex mr-1">
                            {[...Array(parseInt(option.id.charAt(0)))].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                            ))}
                          </div>
                        )}
                        {option.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4 lg:w-4/5">
            {/* Search and Sort Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-grow">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder="Search by title or author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-navy text-white px-3 py-1 rounded-md text-xs hover:bg-gold transition-colors"
                    >
                      Search
                    </button>
                  </form>
                </div>
                
                {/* Sort Dropdown */}
                <div className="w-full md:w-48">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          Sort by: {option.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* View Toggle */}
                <div className="flex items-center bg-gray-200 rounded-md">
                  <button
                    onClick={() => toggleViewMode('grid')}
                    className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-gray-100'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleViewMode('list')}
                    className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-gray-100'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredBooks.length > 0 ? indexOfFirstBook + 1 : 0}-
                {Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length} results
              </p>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy"></div>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
                {error}
                <button 
                  className="ml-4 underline"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Empty State */}
            {!loading && !error && filteredBooks.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium text-navy mb-2">No books found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setFilters({ category: 'all', price: 'all', rating: 'all' });
                    setSearchQuery('');
                    setAppliedSearchQuery('');
                    setSortBy('popularity');
                  }}
                  className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
            
            {/* Books Grid/List View */}
            {!loading && !error && filteredBooks.length > 0 && (
              <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"}>
                {currentBooks.map(book => (
                  <div key={book.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex' : ''} relative`}>
                    <Link to={`/book/${book.id}`} className={`${viewMode === 'list' ? 'w-1/4 min-w-[100px]' : ''} relative`}>
                      {/* Bestseller Tag */}
                      {book.rating > 4 && (
                        <div className="absolute top-0 left-0 bg-gold text-navy text-xs font-bold px-2 py-1 z-10">
                          Bestseller
                        </div>
                      )}
                      
                      <div className={`${viewMode === 'grid' ? 'aspect-[3/4]' : 'h-full'} bg-gray-100 flex items-center justify-center`}>
                        <img 
                          src={book.imageUrl || `https://via.placeholder.com/300x450?text=${encodeURIComponent(book.title)}`}
                          alt={book.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                      
                    {/* Bookmark Button */}
                    <button 
                      onClick={() => handleBookmarkToggle(book)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-sm hover:bg-gold hover:text-white transition-colors z-10"
                    >
                      <Bookmark className="h-4 w-4 text-navy" fill={bookmarkStates[book.id] ? 'currentColor' : 'none'} />
                    </button>
                    
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <Link to={`/book/${book.id}`} className="hover:text-gold transition-colors">
                        <h3 className="font-medium text-navy text-sm truncate">{book.title}</h3>
                        <p className="text-xs text-gray-600 mb-1 truncate">
                          {book.authors?.join(', ') || 'Unknown Author'}
                        </p>
                      </Link>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                        <button 
                          className="bg-navy text-white text-xs px-2 py-1 rounded-sm hover:bg-gold transition-colors"
                          onClick={() => handleAddToCart(book)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-1">
                  {/* Previous button */}
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // If near start, show first 5 pages
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // If near end, show last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Otherwise show current page and 2 pages on each side
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          currentPage === pageNum
                            ? 'bg-navy text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {/* Next button */}
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Books;