import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, ChevronDown, Star, StarHalf, Grid, List, Bookmark } from 'lucide-react';
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
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Browse Books</h1>
          <p className="text-gray-600">Discover your next favorite read</p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  className="w-full p-2 pl-10 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-navy text-white px-3 py-1 rounded-md text-sm hover:bg-gold transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-navy px-4 py-2 rounded-md transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-md">
              <button
                onClick={() => toggleViewMode('grid')}
                className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-navy'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => toggleViewMode('list')}
                className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-navy text-white' : 'text-navy'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  value={filters.price}
                  onChange={(e) => handleFilterChange('price', e.target.value)}
                >
                  {priceRanges.map(range => (
                    <option key={range.id} value={range.id}>{range.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                >
                  {ratingOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
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
                setSortBy('popularity');
              }}
              className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {/* Books Grid */}
        {!loading && !error && filteredBooks.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {indexOfFirstBook + 1}-{Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length} books
            </p>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentBooks.map(book => (
                  <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-56 bg-gray-200">
                      <img 
                        src={book.coverImageUrl || `https://via.placeholder.com/300x450?text=${encodeURIComponent(book.title)}`} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-book-cover.jpg';
                        }}
                      />
                      <button 
                        onClick={() => handleBookmarkToggle(book)}
                        className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                      >
                        <Bookmark className="h-4 w-4 text-navy" fill={isBookmarked(book.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-navy truncate">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 truncate">
                        {book.author || (book.authors && book.authors.join(', '))}
                      </p>
                      {renderRating(book.rating || 0)}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gold font-bold">${book.price?.toFixed(2)}</span>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/books/${book.id}`}
                            className="flex-1 bg-navy text-white text-center py-1.5 rounded-md text-sm hover:bg-gold transition-colors"
                          >
                            Details
                          </Link>
                          <button 
                            className="flex-1 bg-gold text-navy text-center py-1.5 rounded-md text-sm hover:bg-gold-dark transition-colors"
                            onClick={() => {
                              // Add to cart logic
                              const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                              const existingItem = cart.find(item => item.id === book.id);
                              
                              if (existingItem) {
                                existingItem.quantity += 1;
                              } else {
                                cart.push({
                                  id: book.id,
                                  title: book.title,
                                  price: book.price,
                                  coverImage: book.coverImageUrl,
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentBooks.map(book => (
                  <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4 flex">
                    <div className="relative h-32 w-24 bg-gray-200 flex-shrink-0">
                      <img 
                        src={book.coverImageUrl || `https://via.placeholder.com/300x450?text=${encodeURIComponent(book.title)}`} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-book-cover.jpg';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-navy">{book.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {book.author || (book.authors && book.authors.join(', '))}
                          </p>
                          {renderRating(book.rating || 0)}
                        </div>
                        <button 
                          onClick={() => handleBookmarkToggle(book)}
                          className="p-1.5 h-fit rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Bookmark className="h-4 w-4 text-navy" fill={isBookmarked(book.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 my-2 line-clamp-2">
                        {book.description || 'No description available.'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gold font-bold">${book.price?.toFixed(2)}</span>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/books/${book.id}`}
                            className="bg-navy text-white text-center py-1.5 px-3 rounded-md text-sm hover:bg-gold transition-colors"
                          >
                            Details
                          </Link>
                          <button 
                            className="bg-gold text-navy text-center py-1.5 px-3 rounded-md text-sm hover:bg-gold-dark transition-colors"
                            onClick={() => {
                              // Add to cart logic
                              const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                              const existingItem = cart.find(item => item.id === book.id);
                              
                              if (existingItem) {
                                existingItem.quantity += 1;
                              } else {
                                cart.push({
                                  id: book.id,
                                  title: book.title,
                                  price: book.price,
                                  coverImage: book.coverImageUrl,
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
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-navy text-white hover:bg-gold transition-colors'}`}
                  >
                    Prev
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current page
                      return page === 1 || page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => {
                      // Add ellipsis
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-md">...</span>
                            <button
                              onClick={() => paginate(page)}
                              className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-gold text-navy font-bold' : 'bg-gray-200 text-navy hover:bg-gray-300 transition-colors'}`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-gold text-navy font-bold' : 'bg-gray-200 text-navy hover:bg-gray-300 transition-colors'}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-navy text-white hover:bg-gold transition-colors'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default Books;