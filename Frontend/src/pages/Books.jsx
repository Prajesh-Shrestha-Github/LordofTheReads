import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, ChevronDown, Star, StarHalf, Grid, List, Bookmark } from 'lucide-react';
import { addBookmark, isBookmarked, removeBookmark } from '../services/bookmarkService';
import axios from 'axios';

function Books() {
  // Books data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
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
      const authorMatch = book.author?.toLowerCase().includes(query) || 
                         (book.authors && book.authors.some(author => author.toLowerCase().includes(query))) || 
                         false;
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

  // Handle bookmark toggle
  const handleBookmarkToggle = async (book) => {
    try {
      const bookmarked = await isBookmarked(book.id);
      
      if (bookmarked) {
        await removeBookmark(book.id);
        setNotification({
          show: true,
          message: `${book.title} removed from bookmarks`,
          type: 'success'
        });
      } else {
        await addBookmark(book);
        setNotification({
          show: true,
          message: `${book.title} added to bookmarks`,
          type: 'success'
        });
      }
      
      // Trigger custom event to update bookmark count in navbar
      window.dispatchEvent(new Event('bookmarksUpdated'));
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setNotification({
        show: true,
        message: 'Failed to update bookmarks',
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Render star ratings
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-gold text-gold" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="w-4 h-4 fill-gold text-gold" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-beige">
      <Navbar />
      
      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 bg-navy text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fade-in-up">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2 text-gold" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{notification.message}</span>
            <Link 
              to={notification.type === 'bookmark' || notification.type === 'success' && notification.message.includes('bookmark') ? "/bookmarks" : "/cart"}
              className="ml-4 text-white hover:text-gold"
            >
              {notification.type === 'bookmark' || (notification.type === 'success' && notification.message.includes('bookmark')) ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </Link>
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
                        {category.name} {category.id !== 'all' && `(${filteredBooks.filter(book => book.category === category.id).length})`}
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
              
              {/* Availability */}
              <div>
                <h3 className="font-medium text-navy mb-2">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="in-stock"
                      className="mr-2"
                    />
                    <label htmlFor="in-stock" className="text-sm text-gray-600">In Stock</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pre-order"
                      className="mr-2"
                    />
                    <label htmlFor="pre-order" className="text-sm text-gray-600">Pre-Order</label>
                  </div>
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-navy text-white px-3 py-1 rounded-md hover:bg-gold transition-colors"
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
                  <div key={book.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-1/4 min-w-[100px]' : ''}`}>
                      {/* Bestseller Tag */}
                      {book.rating > 4 && (
                        <div className="absolute top-0 left-0 bg-gold text-navy text-xs font-bold px-2 py-1 z-10">
                          Bestseller
                        </div>
                      )}
                      
                      <div className={`${viewMode === 'grid' ? 'aspect-[3/4]' : 'h-full'} bg-gray-100 flex items-center justify-center`}>
                        <img 
                          src={book.imageUrl || `https://placehold.co/300x450?text=${encodeURIComponent(book.title)}`}
                          alt={book.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Use placehold.co as a fallback
                            e.target.src = `https://placehold.co/300x450/e2e8f0/1e293b?text=No+Cover`;
                          }}
                        />
                      </div>
                      
                      {/* Bookmark Button */}
                      <button 
                        onClick={() => handleBookmarkToggle(book)}
                        className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                      >
                        <Bookmark className="h-4 w-4 text-navy" fill={isBookmarked(book.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <h3 className="font-medium text-navy text-sm truncate">{book.title}</h3>
                      <p className="text-xs text-gray-600 mb-1 truncate">
                        {book.author || (book.authors && book.authors.join(', '))}
                      </p>
                      
                      <div className="flex items-center mb-2">
                        {renderRating(book.rating || 0)}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                        <button 
                          className="bg-navy text-white text-xs px-2 py-1 rounded-sm hover:bg-gold transition-colors"
                          onClick={() => {
                            // Add to cart logic
                            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                            const existingItem = cart.find(item => item.bookId === book.id);
                            
                            if (existingItem) {
                              existingItem.quantity += 1;
                            } else {
                              cart.push({
                                bookId: book.id,
                                id: book.id,
                                title: book.title,
                                price: book.price || 0,
                                imageUrl: book.imageUrl,
                                quantity: 1
                              });
                            }
                            
                            localStorage.setItem('cart', JSON.stringify(cart));
                            window.dispatchEvent(new Event('cartUpdated'));
                            
                            setNotification({
                              show: true,
                              message: `${book.title} added to cart`,
                              type: 'success'
                            });
                            
                            setTimeout(() => {
                              setNotification({ show: false, message: '', type: '' });
                            }, 3000);
                          }}
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
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-navy hover:bg-gray-100'
                    }`}
                  >
                    Prev
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === number
                          ? 'bg-navy text-white'
                          : 'bg-white text-navy hover:bg-gray-100'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-navy hover:bg-gray-100'
                    }`}
                  >
                    Next
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