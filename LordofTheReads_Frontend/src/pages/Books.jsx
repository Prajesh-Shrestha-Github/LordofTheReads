import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, ChevronDown, Star, StarHalf } from 'lucide-react';

function Books() {
  // Sample books data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    category: 'all',
    price: 'all',
    rating: 'all',
  });
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
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
    // This would be replaced with an actual API call
    const fetchBooks = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Sample data
        const sampleBooks = Array(24).fill().map((_, index) => ({
          id: index + 1,
          title: `Book Title ${index + 1}`,
          author: `Author Name ${index % 5 + 1}`,
          price: 9.99 + (index % 5) * 5,
          rating: 3 + (index % 5) * 0.5,
          category: categories[1 + (index % 6)].id,
          coverImage: `/book-cover-${(index % 8) + 1}.jpg`,
          publicationDate: new Date(2022, (index % 12), (index % 28) + 1).toISOString(),
        }));
        
        setBooks(sampleBooks);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books. Please try again later.');
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
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
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
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">Browse Our Collection</h1>
          <p className="text-gray">Discover your next literary adventure from our vast selection of books</p>
        </div>
        
        {/* Search and Filter Bar */}
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
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={toggleFilters}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-navy text-white rounded-md"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Filter Options - Hidden on mobile unless toggled */}
          <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            {/* Category Filter */}
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-navy mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  id="category-filter"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2 border border-gray rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray pointer-events-none" />
              </div>
            </div>
            
            {/* Price Filter */}
            <div>
              <label htmlFor="price-filter" className="block text-sm font-medium text-navy mb-1">
                Price Range
              </label>
              <div className="relative">
                <select
                  id="price-filter"
                  value={filters.price}
                  onChange={(e) => handleFilterChange('price', e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2 border border-gray rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {priceRanges.map(range => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray pointer-events-none" />
              </div>
            </div>
            
            {/* Rating Filter */}
            <div>
              <label htmlFor="rating-filter" className="block text-sm font-medium text-navy mb-1">
                Rating
              </label>
              <div className="relative">
                <select
                  id="rating-filter"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2 border border-gray rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {ratingOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
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
          
          {/* Clear Filters Button - Only show if filters are applied */}
          {(filters.category !== 'all' || filters.price !== 'all' || filters.rating !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilters({ category: 'all', price: 'all', rating: 'all' });
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-sm text-gold hover:text-gold-dark"
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
            {error}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-navy mb-4">No books found matching your criteria.</p>
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
                <Link to={`/books/${book.id}`} className="block">
                  <div className="aspect-[2/3] bg-beige flex items-center justify-center">
                    {/* Book cover placeholder */}
                    <div className="w-full h-full bg-beige flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-navy font-bold">
                        {book.title.substring(0, 2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-navy mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-gray mb-2">{book.author}</p>
                    
                    <div className="flex items-center mb-2">
                      {renderRating(book.rating)}
                      <span className="text-xs text-gray ml-1">({book.rating.toFixed(1)})</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-navy">${book.price.toFixed(2)}</span>
                      <button className="bg-navy text-white text-xs px-2 py-1 rounded-sm hover:bg-gold transition-colors">
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
      
      <Footer />
    </div>
  );
}

export default Books;