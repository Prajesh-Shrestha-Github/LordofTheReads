import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, ChevronDown, Star, StarHalf, Grid, List } from 'lucide-react';
import { addBookmark, isBookmarked, removeBookmark } from '../services/bookmarkService';
import axios from 'axios';

function Books() {
  // Sample books data
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
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;
  
  // Categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'sci-fi', name: 'Science Fiction' },
    { id: 'mystery', name: 'Mystery' },
    { id: 'romance', name: 'Romance' },
    { id: 'non-fiction', name: 'Non-Fiction' },
    { id: 'children', name: 'Children\'s Books' },
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
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
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
    // Search is already handled by the filteredBooks function
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Toggle filters on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Render star ratings
  const renderRating = (rating) => {
    // Default to 0 if rating is undefined or null
    const ratingValue = rating || 0;
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-gold text-gold" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-gold text-gold" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray" />);
    }
    
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">Explore Our Collection</h1>
          <p className="text-gray">Discover thousands of books across every genre, from timeless classics to the latest bestsellers.</p>
        </div>
        
        {/* Main Content with Filters on Left */}
        <div className="flex flex-col md:flex-row gap-8"> 
          {/* Filters Sidebar */}
          <div className="md:w-1/4 lg:w-1/5">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="mb-6">
                <h2 className="font-medium text-navy mb-4">Filters</h2>
                <button 
                  onClick={() => {
                    setFilters({ category: 'all', price: 'all', rating: 'all' });
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="text-sm text-gold hover:text-gold-dark mb-4 inline-block"
                >
                  Clear All
                </button>
                
                {/* Categories Filter */}
                <div className="mb-6">
                  <h3 className="font-medium text-navy mb-2">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={filters.category === category.id.toString()}
                          onChange={() => handleFilterChange('category', filters.category === category.id.toString() ? 'all' : category.id.toString())}
                          className="mr-2"
                        />
                        <label htmlFor={`category-${category.id}`} className="text-sm text-gray">
                          {category.name} {category.id !== 'all' && `(${filteredBooks.filter(book => book.genres?.includes(category.name)).length})`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="font-medium text-navy mb-2">Price Range</h3>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.price === 'all' ? 50 : parseInt(filters.price)}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray mt-1">
                    <span>$0</span>
                    <span>$50+</span>
                  </div>
                </div>
                
                {/* Rating Filter */}
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
                        <label htmlFor={`rating-${option.id}`} className="text-sm text-gray flex items-center">
                          {option.id !== 'all' && (
                            <div className="flex text-gold mr-1">
                              {[...Array(parseInt(option.id.charAt(0)))].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-gold" />
                              ))}
                            </div>
                          )}
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Availability Filter */}
                <div>
                  <h3 className="font-medium text-navy mb-2">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="in-stock"
                        className="mr-2"
                      />
                      <label htmlFor="in-stock" className="text-sm text-gray">In Stock</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="pre-order"
                        className="mr-2"
                      />
                      <label htmlFor="pre-order" className="text-sm text-gray">Pre-Order</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
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
                      className="w-full pl-10 pr-4 py-2 border border-gray rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray" />
                  </form>
                </div>
                
                {/* Sort Dropdown */}
                <div className="w-full md:w-64">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full appearance-none pl-4 pr-10 py-2 border border-gray rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          Sort by: {option.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray">
                Showing {filteredBooks.length > 0 ? indexOfFirstBook + 1 : 0}-
                {Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length} results
              </p>
              
              <div className="flex items-center gap-2">
                <button className={`p-1 border ${viewMode === 'grid' ? 'border-gold text-gold' : 'border-gray text-gray'} rounded`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button className={`p-1 border ${viewMode === 'list' ? 'border-gold text-gold' : 'border-gray text-gray'} rounded`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Book Results */}
            {loading ? (
              <div className="text-center py-10">Loading books...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray mb-4">No books found matching your criteria</p>
                <button
                  onClick={() => {
                    setFilters({ category: 'all', price: 'all', rating: 'all' });
                    setSearchQuery('');
                  }}
                  className="text-gold hover:text-gold-dark font-medium"
                >
                  Clear filters and try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentBooks.map(book => (
                  <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <Link to={`/books/${book.id}`} className="block relative">
                      <div className="aspect-[2/3] bg-beige flex items-center justify-center overflow-hidden">
                        {book.coverImageUrl ? (
                          <img 
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-navy font-bold">
                            {book.title.substring(0, 2)}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigation from Link
                          // Toggle bookmark
                          if (isBookmarked(book.id)) {
                            removeBookmark(book.id);
                            setNotification({ 
                              show: true, 
                              message: `${book.title} removed from bookmarks!`,
                              type: 'bookmark'
                            });
                          } else {
                            addBookmark(book);
                            setNotification({ 
                              show: true, 
                              message: `${book.title} added to bookmarks!`,
                              type: 'bookmark'
                            });
                          }
                          
                          // Hide notification after 3 seconds
                          setTimeout(() => {
                            setNotification({ show: false, message: '', type: '' });
                          }, 3000);
                        }}
                        className="absolute top-2 right-2 bg-white p-1.5 rounded-md shadow-md z-10"
                        aria-label={isBookmarked(book.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          fill={isBookmarked(book.id) ? "#2563EB" : "none"} 
                          viewBox="0 0 24 24" 
                          stroke={isBookmarked(book.id) ? "#2563EB" : "#1E2B38"} 
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-navy mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-gray mb-2">{book.author || book.authors?.join(', ') || 'Unknown Author'}</p>
                        
                        <div className="flex items-center mb-2">
                          {renderRating(book.rating)}
                          <span className="text-xs text-gray ml-1">({(book.rating || 0).toFixed(1)})</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                          <button 
                            onClick={(e) => {
                              e.preventDefault(); // Prevent navigation from Link
                              // Add to cart using localStorage
                              const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                              const existingItem = cart.find(item => item.bookId === book.id);
                              
                              if (existingItem) {
                                existingItem.quantity += 1;
                              } else {
                                cart.push({ bookId: book.id, quantity: 1 });
                              }
                              
                              localStorage.setItem('cart', JSON.stringify(cart));
                              
                              // Dispatch event to update cart count in navbar
                              window.dispatchEvent(new Event('cartUpdated'));
                              
                              // Show notification
                              setNotification({ 
                                show: true, 
                                message: `${book.title} added to cart!`,
                                type: 'cart'
                              });
                              
                              // Hide notification after 3 seconds
                              setTimeout(() => {
                                setNotification({ show: false, message: '', type: '' });
                              }, 3000);
                            }}
                            className="bg-navy text-white text-xs px-2 py-1 rounded-sm hover:bg-gold transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && !error && filteredBooks.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray cursor-not-allowed'
                        : 'bg-white text-navy hover:bg-beige'
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
                          : 'bg-white text-navy hover:bg-beige'
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
                        ? 'bg-gray-100 text-gray cursor-not-allowed'
                        : 'bg-white text-navy hover:bg-beige'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
        
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
                to={notification.type === 'bookmark' ? "/bookmarks" : "/cart"}
                className="ml-4 text-white hover:text-gold"
              >
                {notification.type === 'bookmark' ? (
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
      </div>
      
      <Footer />
    </div>
  );
}

export default Books;