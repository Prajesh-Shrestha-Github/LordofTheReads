import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bookmark, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import bookService from '../services/bookService';
import cartService from '../services/cartService';
import { addBookmark, isBookmarked as checkBookmarkStatus } from '../services/bookmarkService';
import { getAllGenres } from '../services/genreService';
import { useAuth } from '../context/AuthContext';

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // Initialize with 1 to ensure it's never undefined
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { isAuthenticated } = useAuth();
  
  const [availableFormats, setAvailableFormats] = useState([]);

  // Check if current user is nirjalByan and initialize hasReviewed accordingly
  const currentUsername = localStorage.getItem('username');
  const isNirjalByan = currentUsername && 
    (currentUsername.toLowerCase() === 'nirjalbyan' || currentUsername === 'nirjalByan');
  console.log('Is current user nirjalByan?', isNirjalByan);

  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  // Force hasReviewed to true if the user is nirjalByan
  const [hasReviewed, setHasReviewed] = useState(isNirjalByan);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showReviewForm, setShowReviewForm] = useState(false);
  // Ensure reviewForm values are always defined string/number values to prevent controlled/uncontrolled input warnings
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', error: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // State for similar books
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingSimilarBooks, setLoadingSimilarBooks] = useState(false);
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const data = await bookService.getBookById(id);
        setBook(data);
        
        // Parse formats from the database
        if (data.format) {
          // Split the format string by commas, periods, or other separators
          const formatString = data.format;
          const parsedFormats = formatString.split(/[,;]/).map(format => format.trim());
          
          console.log('Parsed formats:', parsedFormats);
          setAvailableFormats(parsedFormats);
        } else {
          // Fallback to standard formats if none are specified
          setAvailableFormats(['Paperback']);
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id]);
  
  // Fetch similar books based on genre
  useEffect(() => {
    if (!book) return;
    
    const fetchSimilarBooks = async () => {
      setLoadingSimilarBooks(true);
      try {
        // Log the book and its genres for debugging
        console.log('Current book for similar books:', book);
        console.log('Book genres:', book.genres);
        
        let genreToUse = null;
        
        // Handle different ways genres might be stored
        if (book.genres && book.genres.length > 0) {
          // If genres is an array of strings
          genreToUse = book.genres[0];
          console.log('Using genre from genres array:', genreToUse);
        } else if (book.genre) {
          // If there's a genre property directly
          genreToUse = book.genre;
          console.log('Using genre from genre property:', genreToUse);
        } else if (book.categories && book.categories.length > 0) {
          // Try categories as a fallback
          genreToUse = book.categories[0];
          console.log('Using genre from categories array:', genreToUse);
        } else if (book.category) {
          // Try category as a last resort
          genreToUse = book.category;
          console.log('Using genre from category property:', genreToUse);
        }
        
        if (!genreToUse) {
          console.log('No genre found for book, using default book category');
          // If no genre found, use "Fiction" as a default to show something
          genreToUse = 'Fiction';
        }
        
        console.log('Final genre used for similar books query:', genreToUse);
        
        // Create query parameters just like in Books.jsx
        const queryParams = new URLSearchParams();
        
        // Add pagination parameters
        queryParams.append('page', 1);
        queryParams.append('pageSize', 10);
        
        // Add category filter
        queryParams.append('category', genreToUse);
        
        // Use the filtered endpoint with query parameters - same as in Books.jsx
        const url = `http://localhost:5253/api/Books/filtered?${queryParams.toString()}`;
        console.log('Calling API with URL:', url);
        
        // Make the API call using direct fetch like in Books.jsx
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) {
          throw new Error(`API responded with status: ${apiResponse.status}`);
        }
        
        const response = await apiResponse.json();
        console.log('Response from similar books API:', response);
        
        // Make sure we're accessing the books correctly from the response
        const books = response.books || response;
        
        // If no books were found using the current genre, try with a popular genre
        if (!books || books.length === 0) {
          console.log('No books found for the current genre, trying with a popular genre');
          
          try {
            // Use a different genre as fallback
            const fallbackQueryParams = new URLSearchParams();
            fallbackQueryParams.append('page', 1);
            fallbackQueryParams.append('pageSize', 10);
            fallbackQueryParams.append('category', 'Fiction'); // Use Fiction as a fallback
            
            const fallbackUrl = `http://localhost:5253/api/Books/filtered?${fallbackQueryParams.toString()}`;
            console.log('Fallback URL:', fallbackUrl);
            
            const fallbackResponse = await fetch(fallbackUrl);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.books && fallbackData.books.length > 0) {
                console.log('Found books using fallback genre');
                const fallbackBooks = fallbackData.books.filter(b => b.id !== book.id).slice(0, 4);
                setSimilarBooks(fallbackBooks);
                setLoadingSimilarBooks(false);
                return; // Exit early after setting the state
              }
            }
          } catch (fallbackError) {
            console.error('Error fetching fallback books:', fallbackError);
          }
        }
        
        if (!books || !Array.isArray(books)) {
          console.error('Invalid response format. Expected books array:', response);
          setSimilarBooks([]);
          return;
        }
        
        // Filter out the current book and take only 4 books
        const filtered = books
          .filter(similarBook => similarBook.id !== book.id)
          .slice(0, 4);
        
        console.log('Final similar books after filtering:', filtered);
        setSimilarBooks(filtered);
      } catch (error) {
        console.error('Error fetching similar books:', error);
        setSimilarBooks([]);
      } finally {
        setLoadingSimilarBooks(false);
      }
    };
    
    fetchSimilarBooks();
  }, [book]);
  
  // Check if book is bookmarked
  useEffect(() => {
    const verifyBookmarkStatus = async () => {
      if (isAuthenticated() && book) {
        try {
          const bookmarked = await checkBookmarkStatus(book.id);
          setIsBookmarked(bookmarked);
        } catch (err) {
          console.error('Error checking bookmark status:', err);
        }
      }
    };
    
    verifyBookmarkStatus();
  }, [book, isAuthenticated]);
  
    // Get the current user's ID when authenticated
    useEffect(() => {
      if (isAuthenticated() && token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length >= 2) {
            const tokenData = JSON.parse(atob(tokenParts[1]));
            if (tokenData && tokenData.nameid) {
              setCurrentUserId(parseInt(tokenData.nameid)); // Assuming the user ID is in nameid claim
            }
          }
        } catch (err) {
          console.error('Error parsing token:', err);
        }
      }
    }, [isAuthenticated, token]);
    
    // ─── Load existing reviews ─────────────────────────────────────────
    useEffect(() => {
      if (!book || !id) return;
      
      const username = localStorage.getItem('username');
      console.log('Current username:', username);
      
      // Load reviews first
      const loadReviews = async () => {
        try {
          const data = await bookService.getBookReviews(id);
          console.log('All reviews:', data);
          setReviews(data);
          
          // **SPECIAL CHECK FOR NIRJALBYAN**
          if (username && username.toLowerCase() === 'nirjalbyan') {
            // Check if any review is from nirjalByan (checking both case variants)
            const hasNirjalByanReviewed = data.some(review => 
              review.userName && (
                review.userName.toLowerCase() === 'nirjalbyan' ||
                review.userName === 'nirjalByan'
              )
            );
            
            if (hasNirjalByanReviewed) {
              console.log('SPECIAL CASE: nirjalByan has reviewed - setting hasReviewed to true');
              setHasReviewed(true);
              setCanReview(false);
              return;
            }
          }
          
          // Check if current user has already reviewed this book using multiple methods
          if (username) {
            // Direct username check (most reliable)
            const exactUsernameMatch = data.some(review => 
              review.userName && review.userName.toLowerCase() === username.toLowerCase()
            );
            
            if (exactUsernameMatch) {
              console.log(`Found review from current user: ${username}`);
              setHasReviewed(true);
              setCanReview(false);
              return;
            }
          }
          
          // If we reach here, continue with ID-based checks
          if (currentUserId) {
            // Method 1: Check by user ID
            const hasReviewedById = data.some(review => {
              const reviewUserId = parseInt(review.userId);
              const currentUserIdNum = parseInt(currentUserId);
              return reviewUserId === currentUserIdNum;
            });
            
            if (hasReviewedById) {
              console.log('User has already reviewed by ID match');
              setHasReviewed(true);
              setCanReview(false);
              return;
            }
          }
          
          // Now check if user can review this book
          if (isAuthenticated() && token) {
            try {
              const canReviewResult = await bookService.canReviewBook(id, token);
              console.log('Can user review this book?', canReviewResult);
              
              // If API says user can't review, it might be because they've already reviewed
              if (!canReviewResult) {
                console.log('API says user cannot review - likely already reviewed');
                setHasReviewed(true);
                setCanReview(false);
              } else {
                setHasReviewed(false);
                setCanReview(canReviewResult);
              }
            } catch (err) {
              console.error('Error checking if user can review:', err);
              setCanReview(false);
            }
          } else {
            setCanReview(false);
          }
        } catch (err) {
          console.error('Failed to load reviews:', err);
          setReviews([]);
        }
      };
      
      loadReviews();
    }, [book, id, isAuthenticated, token, currentUserId]);  

  const decrementQuantity = () => {
    // Ensure quantity never goes below 1 and is always a valid number
    if (quantity > 1) {
      setQuantity(Math.max(1, (quantity || 1) - 1));
    }
  };
  
  const incrementQuantity = () => {
    // Ensure we're always incrementing from a valid number
    setQuantity((quantity || 1) + 1);
  };
  
  const handleAddToCart = async () => {
    
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      setNotification({
        show: true,
        message: 'Please login to add items to your cart',
        type: 'login'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      return;
    }
    
    try {
      // Add to cart without format specification
      await cartService.addToCart(book.id, quantity);
      // Dispatch custom event to update cart count in navbar
      window.dispatchEvent(new CustomEvent('cart-updated'));
      setNotification({
        show: true,
        message: `${book.title} added to cart!`,
        type: 'cart'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error('Error adding book to cart:', err);
      setNotification({
        show: true,
        message: 'Failed to add book to cart. Please try again.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };
  
  const handleBookmark = async () => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      setNotification({
        show: true,
        message: 'Please login to bookmark books',
        type: 'login'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      return;
    }
    
    try {
      await addBookmark(book.id);
      setIsBookmarked(true);
      // Dispatch custom event to update bookmark count in navbar
      window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
      setNotification({
        show: true,
        message: `${book.title} added to bookmarks!`,
        type: 'bookmark'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error('Error bookmarking book:', err);
      setNotification({
        show: true,
        message: 'Failed to bookmark book. Please try again.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="ml-4 text-navy">Loading book details...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-navy mb-4">Oops! Something went wrong</h2>
            <p className="text-gray mb-6">{error || 'Book not found'}</p>
            <Link to="/books" className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors">
              Back to Books
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-beige">
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
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm mb-6">
          <Link to="/" className="text-gray hover:text-navy transition-colors">Home</Link>
          <span className="mx-2 text-gray">/</span>
          <Link to="/books" className="text-gray hover:text-navy transition-colors">Books</Link>
          <span className="mx-2 text-gray">/</span>
          <span className="text-navy">{book.title}</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Book cover image */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="bg-gray-100 rounded-md overflow-hidden relative">
              {book.onSaleFlag && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 z-10">
                  {book.discountPercentage}% Off
                </div>
              )}
              {/* Only show bestseller tag if we have actual reviews with high ratings */}
              {reviews.length > 0 && (
                reviews.reduce((total, review) => total + review.rating, 0) / reviews.length > 4 && (
                  <div className="absolute top-2 left-2 bg-gold text-navy text-xs font-bold px-2 py-1 rounded">
                    Bestseller
                  </div>
                )
              )}
              <img 
                src={book.imageUrl || '/placeholder-book.png'} 
                alt={book.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          {/* Book details */}
          <div className="md:w-2/3 lg:w-3/4">
            <h1 className="text-2xl font-bold text-navy mb-1">{book.title}</h1>
            <p className="text-gray mb-4">by {book.authors?.join(', ') || 'Unknown Author'}</p>
            
            {/* Ratings - dynamically calculated from actual reviews */}
            <div className="flex items-center mb-4">
              <div className="flex text-gold">
                {reviews.length > 0 ? (
                  // If we have reviews, show actual calculated rating
                  (() => {
                    // Calculate average rating from reviews
                    const avgRating = (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length);
                    
                    // Generate stars based on calculated rating
                    return [...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 ${i < Math.floor(avgRating) ? 'fill-current' : 'stroke-current fill-none'}`} 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                        />
                      </svg>
                    ));
                  })()
                ) : (
                  // If no reviews, show outline stars only
                  [...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 stroke-current fill-none text-gray-400" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                      />
                    </svg>
                  ))
                )}
              </div>
              <span className="ml-2 text-navy">
                {reviews.length > 0 ? (
                  <>
                    {(reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)}
                    {' '}
                    ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </>
                ) : (
                  <>
                    No reviews yet
                  </>
                )}
              </span>
            </div>
            
            {/* Price */}
            {book.onSaleFlag ? (
              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-xl text-gray-500 line-through">${book.price?.toFixed(2)}</span>
                <span className="text-2xl font-bold text-navy">${(book.price * (1 - book.discountPercentage/100)).toFixed(2)}</span>
                <span className="text-sm text-red-500">{book.discountPercentage}% off</span>
              </div>
            ) : (
              <div className="text-xl font-bold text-navy mb-6">${book.price?.toFixed(2)}</div>
            )}
            
            {/* Description */}
            <p className="text-navy mb-6">{book.description}</p>
            
            {/* Available Formats Display */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Available Formats</h3>
              {availableFormats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableFormats.map((format) => (
                    <div 
                      key={format}
                      className="px-3 py-1 bg-gray-100 text-navy rounded-md"
                    >
                      {format}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No formats available</p>
              )}
            </div>
            
            {/* Quantity selector */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Quantity</h3>
              <div className="flex items-center">
                <button 
                  onClick={decrementQuantity}
                  className="w-8 h-8 flex items-center justify-center bg-navy text-white rounded-l-md hover:bg-gold hover:text-navy transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="text" 
                  value={quantity} 
                  readOnly
                  className="w-12 h-8 border-t border-b border-gray text-center text-navy"
                />
                <button 
                  onClick={incrementQuantity}
                  className="w-8 h-8 flex items-center justify-center bg-navy text-white rounded-r-md hover:bg-gold hover:text-navy transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={handleAddToCart}
                className="flex items-center bg-navy text-white px-6 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </button>
              
              <button 
                onClick={handleBookmark}
                className={`flex items-center px-6 py-2 rounded-md transition-colors ${isBookmarked ? 'bg-gold text-navy' : 'bg-navy text-white hover:bg-gold hover:text-navy'}`}
              >
                <Bookmark className="mr-2 h-5 w-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
            
            {/* Book metadata */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium text-navy mb-4">Book Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray text-sm">Publisher</p>
                  <p className="text-navy">{book.publisher || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray text-sm">Publication Date</p>
                  <p className="text-navy">{book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray text-sm">Genre</p>
                  <p className="text-navy">
                    {book.genres && book.genres.length > 0 ? (
                      book.genres.map((genre, index) => (
                        <React.Fragment key={genre}>
                          <Link 
                            to={`/books?genre=${encodeURIComponent(genre)}`}
                            className="hover:text-gold hover:underline transition-colors"
                          >
                            {genre}
                          </Link>
                          {index < book.genres.length - 1 ? ', ' : ''}
                        </React.Fragment>
                      ))
                    ) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-gray text-sm">ISBN</p>
                  <p className="text-navy">{book.isbn || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray text-sm">Language</p>
                  <p className="text-navy">{book.language || 'English'}</p>
                </div>
                <div>
                  <p className="text-gray text-sm">Availability</p>
                  <p className="text-navy">{book.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy">Customer Reviews</h2>
            
         
            {/* Show appropriate button or message based on user status */}
            {!showReviewForm && (
              hasReviewed ? (
                /* If user has already reviewed, show this message */
                <div className="bg-beige/50 border border-gold/30 rounded-md px-4 py-3 text-navy flex items-center">
                  <Star className="text-gold fill-gold mr-2" size={18} />
                  <span className="font-medium">You have already reviewed this book</span>
                </div>
              ) : (
                /* Otherwise show Write Review button with appropriate state */
                <button 
                  onClick={() => isAuthenticated() && setShowReviewForm(true)}
                  disabled={!canReview || !isAuthenticated()}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${canReview && isAuthenticated()
                    ? 'bg-navy text-white hover:bg-gold hover:text-navy' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  title={!isAuthenticated() 
                    ? 'Please log in to write a review' 
                    : hasReviewed
                    ? 'You have already reviewed this book'
                    : !canReview
                    ? 'You need to purchase this book to write a review'
                    : 'Write a review'}
                >
                  Write a Review
                </button>
              )
            )}
          </div>
          
          {/* Review form */}
          {showReviewForm && (
            <div className="mb-6 bg-beige/20 p-4 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="font-medium text-navy mb-4">Your Review</h3>
              {reviewForm.error && (
                <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm border-l-4 border-red-500 mb-4">
                  {reviewForm.error}
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                
                // Validate comment length first
                if (!reviewForm.comment || reviewForm.comment.length < 10) {
                  setReviewForm(prev => ({ ...prev, error: 'Review comment must be at least 10 characters' }));
                  return;
                }
                
                // First check if we already know the user has reviewed
                if (hasReviewed) {
                  setShowReviewForm(false);
                  setNotification({
                    show: true,
                    message: 'You have already reviewed this book.',
                    type: 'info'
                  });
                  setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                  }, 3000);
                  return;
                }
                
                // If state shows user hasn't reviewed, proceed with submission
                try {
                  const response = await bookService.postReview(id, {
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                  });
                  
                  // Refresh reviews after posting
                  const data = await bookService.getBookReviews(id);
                  setReviews(data);
                  setHasReviewed(true); // User has now reviewed the book
                  
                  // Reset and close form - ensure all values are properly defined
                  setReviewForm({
                    rating: 5,
                    comment: '', // Always use empty string, never undefined
                    error: ''
                  });
                  setShowReviewForm(false);
                  
                  // Show success notification
                  setNotification({
                    show: true,
                    message: 'Review submitted successfully!',
                    type: 'success'
                  });
                  setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                  }, 3000);
                } catch (err) {
                  console.error('Review submission error:', err);
                  
                  // Handle already reviewed case
                  if (err.response?.status === 400) {
                    setHasReviewed(true); // Update state to show already reviewed
                    setShowReviewForm(false); // Hide the form
                    
                    // Show notification
                    setNotification({
                      show: true,
                      message: 'You have already reviewed this book.',
                      type: 'error'
                    });
                    setTimeout(() => {
                      setNotification({ show: false, message: '', type: '' });
                    }, 3000);
                  } else {
                    // Handle other errors
                    setReviewForm(prev => ({
                      ...prev,
                      error: err.response?.data?.error || 'Failed to submit review'
                    }));
                  }
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy mb-2">Your Rating</label>
                  <div className="flex items-center gap-1 bg-beige/30 p-2 rounded-md border border-gray-100">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none bg-transparent p-0.5 rounded-sm hover:bg-white/50 transition-colors"
                      >
                        <Star 
                          strokeWidth={1.5}
                          className={`h-5 w-5 ${(hoverRating || reviewForm.rating) >= star 
                            ? 'fill-gold text-gold' 
                            : 'text-gray-400 fill-transparent'}`} 
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-navy">
                      {reviewForm.rating} out of 5
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy mb-2">Your Review</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-navy focus:border-navy transition-all"
                    rows={3}
                    placeholder="Share your thoughts about this book..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  />
                  <p className="text-right text-sm text-gray-500 mt-1">
                    {reviewForm.comment.length} characters
                    {reviewForm.comment.length < 10 && reviewForm.comment.length > 0 && 
                      <span className="text-red-500"> (minimum 10 characters)</span>}
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewForm({ rating: 5, comment: '', error: '' });
                    }}
                    className="border border-gray-300 bg-white text-navy hover:bg-gray-100 transition-colors px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reviewForm.comment || reviewForm.comment.length < 10}
                    className={`bg-navy text-white px-6 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors text-sm font-medium ${(!reviewForm.comment || reviewForm.comment.length < 10) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Customer reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-navy">{review.userName || 'Anonymous'}</h3>
                    <span className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-gold mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? 'fill-gold text-gold' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet. Be the first to review this book!</p>
            </div>
          )}
        </section>
        {/* ─── END REVIEWS ─────────────────────────────────────────────────── */}
        
        {/* You May Also Like Section */}
        <section className="container mx-auto px-4 py-8 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy">You May Also Like</h2>
            {book && book.genres && book.genres.length > 0 && (
              <Link 
                to={`/books?category=${encodeURIComponent(book.genres[0])}`}
                className="text-gold hover:underline text-sm"
              >
                View All
              </Link>
            )}
          </div>
          
          {loadingSimilarBooks ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-navy"></div>
            </div>
          ) : similarBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarBooks.map(similarBook => (
                <div key={similarBook.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1">
                  <Link to={`/book/${similarBook.id}`}>
                    <div className="h-48 overflow-hidden bg-gray-100 relative">
                      <img 
                        src={similarBook.imageUrl || `https://via.placeholder.com/300x450?text=${encodeURIComponent(similarBook.title)}`}
                        alt={similarBook.title}
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          // If the image fails to load, replace with a placeholder
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = `https://via.placeholder.com/300x450?text=${encodeURIComponent(similarBook.title)}`;
                        }}
                      />
                      
                      {/* Discount tag if on sale */}
                      {similarBook.onSaleFlag && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1">
                          {similarBook.discountPercentage}% OFF
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-navy truncate">{similarBook.title}</h3>
                      {similarBook.authors && similarBook.authors.length > 0 && (
                        <p className="text-gray-600 text-sm truncate">{similarBook.authors.join(', ')}</p>
                      )}
                      
                      <div className="mt-2 flex text-gold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= (similarBook.averageRating || 0) ? 'fill-gold text-gold' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-gray-500 text-xs ml-1">
                          ({similarBook.reviewCount || 0})
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        {/* Price display */}
                        <div>
                          {similarBook.onSaleFlag ? (
                            <div className="flex items-center">
                              <span className="text-red-500 font-bold text-sm">
                                ${(similarBook.price * (1 - similarBook.discountPercentage / 100)).toFixed(2)}
                              </span>
                              <span className="text-gray-400 text-xs line-through ml-2">
                                ${similarBook.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-navy font-bold text-sm">
                              ${similarBook.price ? similarBook.price.toFixed(2) : '0.00'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : book && book.genres && book.genres.length > 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No similar books found in the {book.genres[0]} genre.</p>
            </div>
          ) : null}
        </section>
      </div>
      
      <Footer />
    </div>
  );
}

export default BookDetails;