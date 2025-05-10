import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { addBookmark, isBookmarked, removeBookmark } from '../services/bookmarkService';
import cartService from '../services/cartService';
import { getAllGenres } from '../services/genreService';
import { getCategories, getBestsellers } from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genresLoading, setGenresLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { user, isAuthenticated, hasRole } = useAuth();
  const [bookmarkStates, setBookmarkStates] = useState({});
  const navigate = useNavigate();
  
  // Special category states
  const [bestsellers, setBestsellers] = useState([]);
  const [awardWinners, setAwardWinners] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      text: '"Lord of the Reads has the best selection of books anywhere. Their customer service is amazing and prices are great, too!"',
      author: 'Sarah Johnson'
    },
    {
      id: 2,
      text: '"The site is so easy to navigate and the quality of books I\'ve received has always been excellent. Will continue shopping here forever!"',
      author: 'William Smith'
    },
    {
      id: 3,
      text: '"Their vast collection is second to none! I found a rare edition I\'d been searching for years. Absolutely thrilled!"',
      author: 'Jennifer Williams'
    }
  ];

  // Helper functions for categorizing books
  // Now uses an actual API call instead of mock data
  const fetchBestsellers = async () => {
    try {
      const bestsellerData = await getBestsellers(5);
      console.log('Bestsellers from API:', bestsellerData);
      setBestsellers(bestsellerData);
    } catch (err) {
      console.error('Error fetching bestsellers:', err);
      // Fallback to random sorting if API fails
      const randomBooks = [...books]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      setBestsellers(randomBooks);
    }
  };

  const getMockAwardWinners = (books) => {
    // Hard-coded random books
    return [...books]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  };

  const getNewReleases = (books) => {
    // Books published within the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    console.log('Three months ago:', threeMonthsAgo);
    
    // Filter for books published in the last 3 months
    const releases = books.filter(book => {
      if (!book.publicationDate) return false;
      const publishDate = new Date(book.publicationDate);
      return publishDate >= threeMonthsAgo;
    });
    
    // Sort by publication date descending (newest first)
    const sortedReleases = [...releases].sort((a, b) => {
      const dateA = new Date(a.publicationDate);
      const dateB = new Date(b.publicationDate);
      return dateB - dateA; // Descending order (newest first)
    });
    
    console.log('Found new releases:', sortedReleases.length);
    return sortedReleases.slice(0, 5);
  };

  const getNewArrivals = (books) => {
    // Most recently added 5 books
    return [...books]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5);
  };

  const getMockComingSoon = (books) => {
    // Hard-coded random books
    return [...books]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  };

  const getOnSaleBooks = (books) => {
    // Books with discount/on sale
    return books
      .filter(book => book.onSaleFlag || (book.discountPercentage && book.discountPercentage > 0))
      .slice(0, 5);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5253/api/book');
        console.log('API Response:', response.data);
        const allBooks = response.data;
        setBooks(allBooks);
        
        // Populate special categories (except bestsellers which has its own API call)
        setAwardWinners(getMockAwardWinners(allBooks));
        setNewReleases(getNewReleases(allBooks));
        setNewArrivals(getNewArrivals(allBooks));
        setComingSoon(getMockComingSoon(allBooks));
        
        // Fetch bestsellers from the API using actual sales data
        fetchBestsellers();
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books. Please make sure the backend server is running.');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Redirect Admin users
  useEffect(() => {
    if (user && hasRole('Admin')) {
      navigate('/admin', { replace: true });
    }
  }, [user, hasRole, navigate]);

  // Fetch genres from the database
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setGenresLoading(true);
        const data = await getAllGenres();
        setGenres(data);
      } catch (err) {
        console.error('Error fetching genres:', err);
      } finally {
        setGenresLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Load bookmark states for all books
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

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      {/* Navbar Component */}
      <Navbar />

      {/* Fixed Hero Section with improved visibility */}
      <section className="bg-navy text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">One Book to Rule Them All</h1>
          <p className="text-lg md:text-xl mb-8 max-w-lg mx-auto">
            Discover your next adventure in our vast collection of books from fantasy to non-fiction
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/books" className="bg-gold hover:bg-gold-dark text-navy px-6 py-3 rounded-md text-base font-medium transition-colors">Browse Collection</Link>
            {!isAuthenticated() && (
              <Link to="/signup" className="bg-white hover:bg-beige text-navy px-6 py-3 rounded-md text-base font-medium transition-colors">Sign Up</Link>
            )}
          </div>
        </div>
      </section>

      {/* Explore Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">Explore Categories</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/books"
              className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
            >
              All Books
            </Link>
            <Link
              to="#bestsellers"
              className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
            >
              Bestsellers
            </Link>
            <Link
              to="#awardwinners"
              className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
            >
              Award Winners
            </Link>
            <Link
              to="#newreleases"
              className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
            >
              New Releases
            </Link>
            <Link
              to="#newarrivals"
              className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              to="#comingsoon"
              className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
            >
              Coming Soon
            </Link>
            <Link
              to="/books?sale=true"
              className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
            >
              Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section id="bestsellers" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">Bestsellers</h2>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mx-auto"></div>
              <p className="mt-4 text-navy">Loading books...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {bestsellers.map(book => (
                <div key={book.id} className="flex flex-col">
                  <div className="bg-beige aspect-[2/3] mb-3 flex items-center justify-center relative overflow-hidden">
                    <Link to={`/book/${book.id}`} className="w-full h-full">
                      <img 
                        src={book.imageUrl || `https://placehold.co/300x450?text=${encodeURIComponent(book.title)}`}
                        alt={book.title}
                        className="object-contain h-full w-full"
                      />
                      {book.onSaleFlag && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                          {book.discountPercentage}% OFF
                        </div>
                      )}
                    </Link>
                    <button 
                      onClick={() => handleBookmarkToggle(book)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-md shadow-md"
                      aria-label={bookmarkStates[book.id] ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill={bookmarkStates[book.id] ? "#2563EB" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke={bookmarkStates[book.id] ? "#2563EB" : "#1E2B38"} 
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <Link to={`/book/${book.id}`} className="hover:text-gold">
                      <h3 className="text-xs font-medium text-navy">{book.title}</h3>
                    </Link>
                    <p className="text-xs text-gray">{book.author || book.authors?.join(', ') || 'Unknown Author'}</p>
                    <div className="flex justify-between items-center mt-2">
                      {book.onSaleFlag ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs text-gray-500 line-through">${book.price.toFixed(2)}</span>
                          <span className="text-xs font-bold text-navy">${(book.price * (1 - book.discountPercentage/100)).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                      )}
                      <button 
                        onClick={() => handleAddToCart(book)}
                        className="text-xs bg-navy text-white px-2 py-1 rounded-sm hover:bg-gold hover:text-navy transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-navy">No bestsellers available</div>
          )}
        </div>
      </section>

      {/* Award Winners Section */}
      <section id="awardwinners" className="py-12 bg-beige">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">Award Winners</h2>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mx-auto"></div>
              <p className="mt-4 text-navy">Loading books...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : awardWinners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {awardWinners.map(book => (
                <div key={book.id} className="flex flex-col">
                  <div className="bg-white aspect-[2/3] mb-3 flex items-center justify-center relative overflow-hidden">
                    <Link to={`/book/${book.id}`} className="w-full h-full">
                      <img 
                        src={book.imageUrl || `https://placehold.co/300x450?text=${encodeURIComponent(book.title)}`}
                        alt={book.title}
                        className="object-contain h-full w-full"
                      />
                      {book.onSaleFlag && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                          {book.discountPercentage}% OFF
                        </div>
                      )}
                    </Link>
                    <button 
                      onClick={() => handleBookmarkToggle(book)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-md shadow-md"
                      aria-label={bookmarkStates[book.id] ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill={bookmarkStates[book.id] ? "#2563EB" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke={bookmarkStates[book.id] ? "#2563EB" : "#1E2B38"} 
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <Link to={`/book/${book.id}`} className="hover:text-gold">
                      <h3 className="text-xs font-medium text-navy">{book.title}</h3>
                    </Link>
                    <p className="text-xs text-gray">{book.author || book.authors?.join(', ') || 'Unknown Author'}</p>
                    <div className="flex justify-between items-center mt-2">
                      {book.onSaleFlag ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs text-gray-500 line-through">${book.price.toFixed(2)}</span>
                          <span className="text-xs font-bold text-navy">${(book.price * (1 - book.discountPercentage/100)).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                      )}
                      <button 
                        onClick={() => handleAddToCart(book)}
                        className="text-xs bg-navy text-white px-2 py-1 rounded-sm hover:bg-gold hover:text-navy transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-navy">No award winners available</div>
          )}
        </div>
      </section>

      {/* New Releases Section */}
      <section id="newreleases" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">New Releases</h2>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mx-auto"></div>
              <p className="mt-4 text-navy">Loading books...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : newReleases.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {newReleases.map(book => (
                <div key={book.id} className="flex flex-col">
                  <div className="bg-beige aspect-[2/3] mb-3 flex items-center justify-center relative overflow-hidden">
                    <Link to={`/book/${book.id}`} className="w-full h-full">
                      <img 
                        src={book.imageUrl || `https://placehold.co/300x450?text=${encodeURIComponent(book.title)}`}
                        alt={book.title}
                        className="object-contain h-full w-full"
                      />
                      {book.onSaleFlag && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                          {book.discountPercentage}% OFF
                        </div>
                      )}
                    </Link>
                    <button 
                      onClick={() => handleBookmarkToggle(book)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-md shadow-md"
                      aria-label={bookmarkStates[book.id] ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill={bookmarkStates[book.id] ? "#2563EB" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke={bookmarkStates[book.id] ? "#2563EB" : "#1E2B38"} 
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <Link to={`/book/${book.id}`} className="hover:text-gold">
                      <h3 className="text-xs font-medium text-navy">{book.title}</h3>
                    </Link>
                    <p className="text-xs text-gray">{book.author || book.authors?.join(', ') || 'Unknown Author'}</p>
                    <div className="flex justify-between items-center mt-2">
                      {book.onSaleFlag ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs text-gray-500 line-through">${book.price.toFixed(2)}</span>
                          <span className="text-xs font-bold text-navy">${(book.price * (1 - book.discountPercentage/100)).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                      )}
                      <button 
                        onClick={() => handleAddToCart(book)}
                        className="text-xs bg-navy text-white px-2 py-1 rounded-sm hover:bg-gold hover:text-navy transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-navy">No new releases available</div>
          )}
        </div>
      </section>
      
      {/* New Arrivals Section */}
      <section id="newarrivals" className="py-12 bg-beige">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">New Arrivals</h2>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mx-auto"></div>
              <p className="mt-4 text-navy">Loading books...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {newArrivals.map(book => (
                <div key={book.id} className="flex flex-col">
                  <div className="bg-white aspect-[2/3] mb-3 flex items-center justify-center relative overflow-hidden">
                    <Link to={`/book/${book.id}`} className="w-full h-full">
                      <img 
                        src={book.imageUrl || `https://placehold.co/300x450?text=${encodeURIComponent(book.title)}`}
                        alt={book.title}
                        className="object-contain h-full w-full"
                      />
                      {book.onSaleFlag && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                          {book.discountPercentage}% OFF
                        </div>
                      )}
                    </Link>
                    <button 
                      onClick={() => handleBookmarkToggle(book)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-md shadow-md"
                      aria-label={bookmarkStates[book.id] ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill={bookmarkStates[book.id] ? "#2563EB" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke={bookmarkStates[book.id] ? "#2563EB" : "#1E2B38"} 
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <Link to={`/book/${book.id}`} className="hover:text-gold">
                      <h3 className="text-xs font-medium text-navy">{book.title}</h3>
                    </Link>
                    <p className="text-xs text-gray">{book.author || book.authors?.join(', ') || 'Unknown Author'}</p>
                    <div className="flex justify-between items-center mt-2">
                      {book.onSaleFlag ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs text-gray-500 line-through">${book.price.toFixed(2)}</span>
                          <span className="text-xs font-bold text-navy">${(book.price * (1 - book.discountPercentage/100)).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                      )}
                      <button 
                        onClick={() => handleAddToCart(book)}
                        className="text-xs bg-navy text-white px-2 py-1 rounded-sm hover:bg-gold hover:text-navy transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-navy">No new arrivals available</div>
          )}
        </div>
      </section>
      
      {/* Coming Soon Section */}
      <section id="comingsoon" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">Coming Soon</h2>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mx-auto"></div>
              <p className="mt-4 text-navy">Loading books...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : comingSoon.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {comingSoon.map(book => (
                <div key={book.id} className="flex flex-col">
                  <div className="bg-beige aspect-[2/3] mb-3 flex items-center justify-center relative overflow-hidden">
                    <Link to={`/book/${book.id}`} className="w-full h-full">
                      <img 
                        src={book.imageUrl || `https://placehold.co/300x450?text=${encodeURIComponent(book.title)}`}
                        alt={book.title}
                        className="object-contain h-full w-full"
                      />
                      {book.onSaleFlag && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                          {book.discountPercentage}% OFF
                        </div>
                      )}
                    </Link>
                    <button 
                      onClick={() => handleBookmarkToggle(book)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-md shadow-md"
                      aria-label={bookmarkStates[book.id] ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill={bookmarkStates[book.id] ? "#2563EB" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke={bookmarkStates[book.id] ? "#2563EB" : "#1E2B38"} 
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <Link to={`/book/${book.id}`} className="hover:text-gold">
                      <h3 className="text-xs font-medium text-navy">{book.title}</h3>
                    </Link>
                    <p className="text-xs text-gray">{book.author || book.authors?.join(', ') || 'Unknown Author'}</p>
                    <div className="flex justify-between items-center mt-2">
                      {book.onSaleFlag ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs text-gray-500 line-through">${book.price.toFixed(2)}</span>
                          <span className="text-xs font-bold text-navy">${(book.price * (1 - book.discountPercentage/100)).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                      )}
                      <button 
                        onClick={() => handleAddToCart(book)}
                        className="text-xs bg-navy text-white px-2 py-1 rounded-sm hover:bg-gold hover:text-navy transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-navy">No coming soon titles available</div>
          )}
        </div>
      </section>
      
      {/* Browse by Genre Section */}
      <section className="py-12 bg-beige">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">Browse by Genre</h2>
          {genresLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
            </div>
          ) : genres.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {genres.map(genre => (
                <Link 
                  key={genre.id} 
                  to={`/books?genre=${encodeURIComponent(genre.name)}`}
                  className="bg-navy text-white p-6 rounded-md flex items-center justify-center hover:bg-gold hover:text-navy transition-colors"
                >
                  <h3 className="text-sm font-medium">{genre.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-navy">No genres available</div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="p-4 bg-white border border-gray rounded-md hover:shadow-md transition-shadow">
                <p className="text-sm italic text-navy mb-2">{testimonial.text}</p>
                <p className="text-xs font-medium text-gray">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            {notification.type === 'login' ? (
              <Link 
                to="/login" 
                className="ml-4 text-white hover:text-gold"
              >
                Login
              </Link>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default Home;