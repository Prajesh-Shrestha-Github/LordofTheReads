import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, ChevronDown, Star, StarHalf, Grid, List, Bookmark, ShoppingCart } from 'lucide-react';
import { addBookmark, isBookmarked, removeBookmark } from '../services/bookmarkService';
import cartService from '../services/cartService';
import { getAllGenres } from '../services/genreService';
import { useAuth } from '../context/AuthContext';
import { getAllBooks, getBookById, filterBooks } from '../services/bookService';

function Books() {
  // Get search parameters from URL
  const [searchParams] = useSearchParams();
  const genreParam = searchParams.get('genre');
  const saleParam = searchParams.get('sale');
  const filterParam = searchParams.get('filter');
  
  // Books data
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // Store all books for filter options
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genresLoading, setGenresLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { isAuthenticated } = useAuth();
  const [bookmarkStates, setBookmarkStates] = useState({});
  
  // Filter options data
  const [availableAuthors, setAvailableAuthors] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availablePublishers, setAvailablePublishers] = useState([]);
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    category: genreParam || 'all',
    price: 'all',
    rating: 'all',
    inStock: 'all',  // Changed from sale to inStock
    access: 'all',
    author: 'all',
    language: 'all',
    format: 'all',
    publisher: 'all',
    onSale: false,    // Added for on sale items
    newRelease: false,
    newArrival: false,
    comingSoon: false,
    awardWinning: false, // Added for award-winning books
  });
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [availableFormats, setAvailableFormats] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Price ranges
  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: '0-10', name: 'Under $10' },
    { id: '10-20', name: '$10 - $20' },
    { id: '20-30', name: '$20 - $30' },
    { id: '30-100', name: 'Over $30' },
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

  // Fetch books with filters
  const fetchFilteredBooks = async () => {
    setLoading(true);
    try {
      console.log('Fetching all books from the regular endpoint');
      
      // Use the regular book endpoint directly
      const response = await fetch('http://localhost:5253/api/book');
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const fetchedBooks = await response.json();
      console.log('Fetched all books:', fetchedBooks);
      
      // Store all books for filter options
      setAllBooks(fetchedBooks);
      
      // Extract unique filter options once when all books are loaded
      if (availableAuthors.length === 0) {
        const authors = [...new Set(fetchedBooks.flatMap(book => book.authors || []))].sort();
        setAvailableAuthors(authors);
      }
      
      if (availableLanguages.length === 0) {
        const languages = [...new Set(fetchedBooks.map(book => book.language).filter(Boolean))].sort();
        setAvailableLanguages(languages);
      }

      // Fetch formats from backend if not already loaded
if (availableFormats.length === 0) {
  const formatResponse = await fetch('http://localhost:5253/api/Books/formats');
  if (formatResponse.ok) {
    const formats = await formatResponse.json();
    setAvailableFormats(['all', ...formats]);
  } else {
    console.warn('Failed to fetch formats');
  }
}

      
      if (availablePublishers.length === 0) {
        const publishers = [...new Set(fetchedBooks.map(book => book.publisher).filter(Boolean))].sort();
        setAvailablePublishers(publishers);
      }
      
      // Apply filters on the client side
      let filteredResults = [...fetchedBooks];
      
      // Apply category filter
      if (filters.category !== 'all') {
        filteredResults = filteredResults.filter(book => 
          book.genres && book.genres.some(genre => 
            genre.toLowerCase() === filters.category.toLowerCase()
          )
        );
      }
      
      // Apply search filter
      if (appliedSearchQuery) {
        const query = appliedSearchQuery.toLowerCase();
        filteredResults = filteredResults.filter(book => 
          (book.title && book.title.toLowerCase().includes(query)) ||
          (book.description && book.description.toLowerCase().includes(query)) ||
          (book.authors && book.authors.some(author => author.toLowerCase().includes(query)))
        );
      }
      
      // Apply rating filter
      if (filters.rating !== 'all') {
        const minRating = parseInt(filters.rating.split('-')[0]);
        filteredResults = filteredResults.filter(book => 
          book.rating >= minRating
        );
      }
      
      // Apply in stock filter
      if (filters.inStock === 'inStock') {
        filteredResults = filteredResults.filter(book => 
          book.stockQuantity > 0
        );
      }
      
      // Apply library access filter
      if (filters.access === 'library') {
        filteredResults = filteredResults.filter(book => 
          book.physicalLibraryAccess === true
        );
      }
      
      // Apply on sale filter
      if (filters.onSale) {
        filteredResults = filteredResults.filter(book => 
          book.onSaleFlag === true
        );
      }
      
      // Apply price filter
      if (filters.price !== 'all') {
        const [minPrice, maxPrice] = filters.price.split('-').map(p => parseFloat(p));
        filteredResults = filteredResults.filter(book => 
          book.price >= minPrice && book.price <= maxPrice
        );
      }
      
      // Apply author filter
      if (filters.author !== 'all') {
        filteredResults = filteredResults.filter(book => 
          book.authors && book.authors.some(author => 
            author.toLowerCase() === filters.author.toLowerCase()
          )
        );
      }
      
      // Apply language filter
      if (filters.language !== 'all') {
        filteredResults = filteredResults.filter(book => 
          book.language && book.language.toLowerCase() === filters.language.toLowerCase()
        );
      }
      
      // Apply format filter
      if (filters.format !== 'all') {
        // For format filtering, we need to be more flexible since formats might be stored differently
        // or a book might be available in multiple formats
        filteredResults = filteredResults.filter(book => {
          if (!book.format) return false;
          
          // Check if the format is contained within the book's format string
          // This handles cases where format might be stored as "Hardcover, Paperback" etc.
          return book.format.toLowerCase().includes(filters.format.toLowerCase());
        });
      }
      
      // Apply publisher filter
      if (filters.publisher !== 'all') {
        filteredResults = filteredResults.filter(book => 
          book.publisher && book.publisher.toLowerCase() === filters.publisher.toLowerCase()
        );
      }
      
      // Apply new release filter
      if (filters.newRelease) {
        // New releases are books published in the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filteredResults = filteredResults.filter(book => 
          book.publicationDate && new Date(book.publicationDate) >= threeMonthsAgo
        );
      }
      
      // Apply new arrival filter
      if (filters.newArrival) {
        // New arrivals are books added to the store in the last month
        // Assuming createdAt field exists, otherwise we'll use publicationDate as a fallback
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredResults = filteredResults.filter(book => 
          (book.createdAt && new Date(book.createdAt) >= oneMonthAgo) ||
          (book.publicationDate && new Date(book.publicationDate) >= oneMonthAgo)
        );
      }
      
      // Apply coming soon filter
      if (filters.comingSoon) {
        // Coming soon books have a future publication date
        const today = new Date();
        filteredResults = filteredResults.filter(book => 
          book.publicationDate && new Date(book.publicationDate) > today
        );
      }
      
      // Apply award-winning filter
      if (filters.awardWinning) {
        // Filter books that are marked as award winning
        filteredResults = filteredResults.filter(book => book.isAwardWinning);
      }
      
      // Apply sorting
      if (sortBy === 'price-low') {
        filteredResults.sort((a, b) => {
          // Use discounted price if available
          const priceA = a.onSaleFlag ? a.price * (1 - a.discountPercentage/100) : a.price;
          const priceB = b.onSaleFlag ? b.price * (1 - b.discountPercentage/100) : b.price;
          return priceA - priceB;
        });
      } else if (sortBy === 'price-high') {
        filteredResults.sort((a, b) => {
          // Use discounted price if available
          const priceA = a.onSaleFlag ? a.price * (1 - a.discountPercentage/100) : a.price;
          const priceB = b.onSaleFlag ? b.price * (1 - b.discountPercentage/100) : b.price;
          return priceB - priceA;
        });
      } else if (sortBy === 'newest') {
        filteredResults.sort((a, b) => {
          return new Date(b.publicationDate) - new Date(a.publicationDate);
        });
      } else if (sortBy === 'rating') {
        filteredResults.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'popularity') {
        // Sort by popularity (bestsellers) based on order count, review count, and rating
        filteredResults.sort((a, b) => {
          // Calculate a popularity score based on multiple factors
          // 1. Order count (if available)
          const aOrderCount = a.orderCount || 0;
          const bOrderCount = b.orderCount || 0;
          
          // 2. Review count
          const aReviewCount = a.reviewCount || 0;
          const bReviewCount = b.reviewCount || 0;
          
          // 3. Rating
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          
          // 4. Award-winning status (give a boost to award-winning books)
          const aAwardBonus = a.isAwardWinning ? 5 : 0;
          const bAwardBonus = b.isAwardWinning ? 5 : 0;
          
          // Calculate weighted popularity score
          // Order count is the primary factor (weight: 3)
          // Review count is secondary (weight: 1)
          // Rating adds additional weight (weight: 2)
          // Award-winning status gives a boost
          const aPopularity = (aOrderCount * 3) + aReviewCount + (aRating * 2) + aAwardBonus;
          const bPopularity = (bOrderCount * 3) + bReviewCount + (bRating * 2) + bAwardBonus;
          
          // Sort in descending order (higher score first)
          return bPopularity - aPopularity;
        });
      }
      
      // Apply pagination
      const totalCount = filteredResults.length;
      const startIndex = (currentPage - 1) * booksPerPage;
      const paginatedResults = filteredResults.slice(startIndex, startIndex + booksPerPage);
      
      console.log('Filtered and paginated results:', paginatedResults);
      
      // Update state with filtered results
      setBooks(paginatedResults);
      setFilteredBooks(paginatedResults);
      setTotalBooks(totalCount);
      setTotalPages(Math.ceil(totalCount / booksPerPage));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books. Please make sure the backend server is running.');
      setLoading(false);
    }
  };
  
  // Map frontend sort options to API sort parameters
  const mapSortByToApi = (sortOption) => {
    switch (sortOption) {
      case 'price-low': return 'price_asc';
      case 'price-high': return 'price_desc';
      case 'newest': return 'date_desc';
      case 'rating': return 'rating';
      case 'popularity': return 'popularity';
      default: return 'title_asc';
    }
  };

  // Fetch books when filters or pagination changes
  useEffect(() => {
    fetchFilteredBooks();
  }, [currentPage, filters, sortBy, appliedSearchQuery]);

  // Handle filter parameter from URL
  useEffect(() => {
    if (filterParam) {
      // Create a new filters object to avoid direct state mutation
      const updatedFilters = { ...filters };
      
      // Set the appropriate filter based on the URL parameter
      if (filterParam === 'new-releases') {
        updatedFilters.newRelease = true;
        // Show filters panel when a specific filter is applied
        setShowFilters(true);
      } else if (filterParam === 'new-arrivals') {
        updatedFilters.newArrival = true;
        // Show filters panel when a specific filter is applied
        setShowFilters(true);
      } else if (filterParam === 'coming-soon') {
        updatedFilters.comingSoon = true;
        // Show filters panel when a specific filter is applied
        setShowFilters(true);
      } else if (filterParam === 'award-winners') {
        // For award winners, we'll need to filter the books in the fetchFilteredBooks function
        // Set a flag to indicate we're looking for award-winning books
        updatedFilters.awardWinning = true;
        // Show filters panel when a specific filter is applied
        setShowFilters(true);
      }
      
      // Update the filters state
      setFilters(updatedFilters);
    }
  }, [filterParam]); // Only run when filterParam changes

  // Fetch genres from the database
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setGenresLoading(true);
        const data = await getAllGenres();
        console.log('Genres fetched:', data); // Log genres for debugging
        setGenres(data);
      } catch (err) {
        console.error('Error fetching genres:', err);
      } finally {
        setGenresLoading(false);
      }
    };

    fetchGenres();
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

  // We no longer need to apply filters on the frontend since we're using backend filtering
  // This useEffect is kept for reference but is not active anymore
  /*
  useEffect(() => {
    if (!books.length) return;

    // All filtering is now handled by the backend API
    // The frontend just displays the filtered results
    
    setFilteredBooks(books);
  }, [books]);
  */

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

  // Display pagination info
  const indexOfLastBook = Math.min(currentPage * booksPerPage, totalBooks);
  const indexOfFirstBook = (currentPage - 1) * booksPerPage + 1;

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
                    setFilters({ 
                      category: 'all', 
                      price: 'all', 
                      rating: 'all', 
                      inStock: 'all', 
                      access: 'all',
                      author: 'all',
                      language: 'all',
                      format: 'all',
                      publisher: 'all',
                      newRelease: false,
                      newArrival: false,
                      comingSoon: false
                    });
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="category-all"
                      checked={filters.category === 'all'}
                      onChange={() => handleFilterChange('category', 'all')}
                      className="mr-2"
                    />
                    <label htmlFor="category-all" className="text-sm text-gray-600">
                      All Categories
                    </label>
                  </div>
                  {genresLoading ? (
                    <div className="text-sm text-gray-500">Loading genres...</div>
                  ) : (
                    genres.map(genre => (
                      <div key={genre.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${genre.id}`}
                          checked={filters.category === genre.name}
                          onChange={() => handleFilterChange('category', genre.name)}
                          className="mr-2"
                        />
                        <label htmlFor={`category-${genre.id}`} className="text-sm text-gray-600">
                          {genre.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="price-all"
                      checked={filters.price === 'all'}
                      onChange={() => handleFilterChange('price', 'all')}
                      className="mr-2"
                    />
                    <label htmlFor="price-all" className="text-sm text-gray-600">
                      All Prices
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="price-0-10"
                      checked={filters.price === '0-10'}
                      onChange={() => handleFilterChange('price', '0-10')}
                      className="mr-2"
                    />
                    <label htmlFor="price-0-10" className="text-sm text-gray-600">
                      Under $10
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="price-10-20"
                      checked={filters.price === '10-20'}
                      onChange={() => handleFilterChange('price', '10-20')}
                      className="mr-2"
                    />
                    <label htmlFor="price-10-20" className="text-sm text-gray-600">
                      $10 - $20
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="price-20-30"
                      checked={filters.price === '20-30'}
                      onChange={() => handleFilterChange('price', '20-30')}
                      className="mr-2"
                    />
                    <label htmlFor="price-20-30" className="text-sm text-gray-600">
                      $20 - $30
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="price-30-100"
                      checked={filters.price === '30-100'}
                      onChange={() => handleFilterChange('price', '30-100')}
                      className="mr-2"
                    />
                    <label htmlFor="price-30-100" className="text-sm text-gray-600">
                      Over $30
                    </label>
                  </div>
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
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="filter-inStock"
                      checked={filters.inStock === 'inStock'}
                      onChange={() => handleFilterChange('inStock', filters.inStock === 'inStock' ? 'all' : 'inStock')}
                      className="mr-2"
                    />
                    <label htmlFor="filter-inStock" className="text-sm text-gray-600">In Stock</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="filter-access"
                      checked={filters.access === 'library'}
                      onChange={() => handleFilterChange('access', filters.access === 'library' ? 'all' : 'library')}
                      className="mr-2"
                    />
                    <label htmlFor="filter-access" className="text-sm text-gray-600">Physical Library Access</label>
                  </div>
                </div>
              </div>
              
              {/* Special Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Special Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="filter-onSale"
                      checked={filters.onSale}
                      onChange={() => handleFilterChange('onSale', !filters.onSale)}
                      className="mr-2"
                    />
                    <label htmlFor="filter-onSale" className="text-sm text-gray-600">On Sale</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="filter-newRelease"
                      checked={filters.newRelease}
                      onChange={() => handleFilterChange('newRelease', !filters.newRelease)}
                      className="mr-2"
                    />
                    <label htmlFor="filter-newRelease" className="text-sm text-gray-600">New Releases</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="filter-newArrival"
                      checked={filters.newArrival}
                      onChange={() => handleFilterChange('newArrival', !filters.newArrival)}
                      className="mr-2"
                    />
                    <label htmlFor="filter-newArrival" className="text-sm text-gray-600">New Arrivals</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="filter-comingSoon"
                      checked={filters.comingSoon}
                      onChange={() => handleFilterChange('comingSoon', !filters.comingSoon)}
                      className="mr-2"
                    />
                    <label htmlFor="filter-comingSoon" className="text-sm text-gray-600">Coming Soon</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="filter-awardWinning"
                      checked={filters.awardWinning}
                      onChange={() => handleFilterChange('awardWinning', !filters.awardWinning)}
                      className="mr-2"
                    />
                    <label htmlFor="filter-awardWinning" className="text-sm text-gray-600">Award Winners</label>
                  </div>
                </div>
              </div>
              
              {/* Authors */}
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Authors</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="author-all"
                      checked={filters.author === 'all'}
                      onChange={() => handleFilterChange('author', 'all')}
                      className="mr-2"
                    />
                    <label htmlFor="author-all" className="text-sm text-gray-600">
                      All Authors
                    </label>
                  </div>
                  {/* Use the pre-extracted authors list */}
                  {availableAuthors.map((author, index) => (
                        <div key={`author-${index}`} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`author-${index}`}
                            checked={filters.author === author}
                            onChange={() => handleFilterChange('author', author)}
                            className="mr-2"
                          />
                          <label htmlFor={`author-${index}`} className="text-sm text-gray-600">
                            {author}
                          </label>
                        </div>
                      ))
                  }
                </div>
              </div>
              
              {/* Languages */}
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Language</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="language-all"
                      checked={filters.language === 'all'}
                      onChange={() => handleFilterChange('language', 'all')}
                      className="mr-2"
                    />
                    <label htmlFor="language-all" className="text-sm text-gray-600">
                      All Languages
                    </label>
                  </div>
                  {/* Use the pre-extracted languages list */}
                  {availableLanguages.map((language, index) => (
                        <div key={`language-${index}`} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`language-${index}`}
                            checked={filters.language === language}
                            onChange={() => handleFilterChange('language', language)}
                            className="mr-2"
                          />
                          <label htmlFor={`language-${index}`} className="text-sm text-gray-600">
                            {language}
                          </label>
                        </div>
                      ))
                  }
                </div>
              </div>
              
            {/* Formats */}
<div className="mb-6">
  <h3 className="font-medium text-navy mb-2">Format</h3>
  <div className="space-y-2 max-h-40 overflow-y-auto">
  {availableFormats.map((format, index) => (

      <div key={`format-${index}`} className="flex items-center">
        <input
          type="checkbox"
          id={`format-${index}`}
          checked={filters.format === format}
          onChange={() => handleFilterChange('format', filters.format === format ? 'all' : format)}
          className="mr-2"
        />
        <label htmlFor={`format-${index}`} className="text-sm text-gray-600">
          {format === 'all' ? 'All Formats' : format}
        </label>
      </div>
    ))}
  </div>
</div>

              {/* Publishers */}
              <div className="mb-6">
                <h3 className="font-medium text-navy mb-2">Publisher</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="publisher-all"
                      checked={filters.publisher === 'all'}
                      onChange={() => handleFilterChange('publisher', 'all')}
                      className="mr-2"
                    />
                    <label htmlFor="publisher-all" className="text-sm text-gray-600">
                      All Publishers
                    </label>
                  </div>
                  {/* Use the pre-extracted publishers list */}
                  {availablePublishers.map((publisher, index) => (
                        <div key={`publisher-${index}`} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`publisher-${index}`}
                            checked={filters.publisher === publisher}
                            onChange={() => handleFilterChange('publisher', publisher)}
                            className="mr-2"
                          />
                          <label htmlFor={`publisher-${index}`} className="text-sm text-gray-600">
                            {publisher}
                          </label>
                        </div>
                      ))
                  }
                </div>
              </div>
              
              {/* End of filters */}
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
                Showing {filteredBooks.length > 0 ? indexOfFirstBook : 0}-
                {Math.min(indexOfLastBook, totalBooks)} of {totalBooks} results
              </p>
            </div>
            
            {/* Books Grid/List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No books found matching your criteria. Try adjusting your filters.</p>
                <button
                  onClick={() => {
                    setFilters({ 
                      category: 'all', 
                      price: 'all', 
                      rating: 'all', 
                      inStock: 'all', 
                      access: 'all',
                      author: 'all',
                      language: 'all',
                      format: 'all',
                      publisher: 'all',
                      newRelease: false,
                      newArrival: false,
                      comingSoon: false
                    });
                    setSearchQuery('');
                    setAppliedSearchQuery('');
                    setSortBy('popularity');
                  }}
                  className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Books Grid/List View */
              <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"}>
                {filteredBooks.map(book => (
                  <div key={book.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${viewMode === 'list' ? 'flex' : ''} relative`}>
                    <Link to={`/book/${book.id}`} className={`${viewMode === 'list' ? 'w-1/4 min-w-[100px]' : ''} relative`}>
                      {/* Bestseller Tag */}
                      {book.rating > 4 && (
                        <div className="absolute top-0 left-0 bg-gold text-navy text-xs font-bold px-2 py-1 z-10">
                          Bestseller
                        </div>
                      )}
                      {/* Sale Tag */}
                      {book.onSaleFlag && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 z-10">
                          {book.discountPercentage}% Off
                        </div>
                      )}
                      {/* Award Winner Tag Removed */}
                      {/* Coming Soon Tag */}
                      {book.publicationDate && new Date(book.publicationDate) > new Date() && (
                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-700 text-white text-xs font-bold px-2 py-1 text-center z-10">
                          Release: {new Date(book.publicationDate).toLocaleDateString()}
                        </div>
                      )}
                      {/* Award Winner Badge at bottom left removed */}
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
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/book/${book.id}`} className="hover:text-gold transition-colors flex-1">
                          <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-1 truncate">
                            {book.authors?.join(', ') || 'Unknown Author'}
                          </p>
                        </Link>
                        {book.isAwardWinning && (
                          <span className="inline-flex items-center ml-2 bg-gold text-navy text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Award Winner
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        {book.onSaleFlag ? (
                          <div className="flex items-baseline space-x-2">
                            <span className="text-sm text-gray-500 line-through">${book.price.toFixed(2)}</span>
                            <span className="text-sm font-bold text-navy">${(book.price * (1 - book.discountPercentage/100)).toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-navy">${book.price.toFixed(2)}</span>
                        )}
                        {book.publicationDate && new Date(book.publicationDate) > new Date() ? (
                          <button 
                            disabled
                            className="bg-gray-400 text-white text-xs px-2 py-1 rounded-sm cursor-not-allowed"
                            title="Available after release date"
                          >
                            Available on release
                          </button>
                        ) : (
                          <button 
                            className="bg-navy text-white text-xs px-2 py-1 rounded-sm hover:bg-gold transition-colors"
                            onClick={() => handleAddToCart(book)}
                          >
                            Add to Cart
                          </button>
                        )}
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
