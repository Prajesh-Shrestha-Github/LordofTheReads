import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bookmark } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { isAuthenticated } = useAuth();
  
  // State to store available formats from database
  const [availableFormats, setAvailableFormats] = useState([]);

  // ─── Reviews state ─────────────────────────────────────────────────
  const [reviews, setReviews]         = useState([]);
  
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
  
  // Check if book is bookmarked and handle upcoming status
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
    
    // Check if book is upcoming based on publication date
    if (book && book.publicationDate) {
      const publishDate = new Date(book.publicationDate);
      const today = new Date();
      // Clear the time portion for date comparison
      today.setHours(0, 0, 0, 0);
      publishDate.setHours(0, 0, 0, 0);
      const isUpcoming = publishDate > today;
      console.log('Book upcoming status:', {
        title: book.title,
        publicationDate: book.publicationDate,
        publishDate: publishDate.toISOString(),
        today: today.toISOString(),
        isUpcoming
      });
      // Store the upcoming status in state
      setIsUpcoming(isUpcoming);
    }
    
    verifyBookmarkStatus();
  }, [book, isAuthenticated]);
  
    // ─── Load existing reviews ─────────────────────────────────────────
    useEffect(() => {
      if (!book) return;
      bookService
        .getBookReviews(id)
        .then(data => setReviews(data))
        .catch(err => {
          console.error('Failed to load reviews', err);
          setReviews([]);
        });
    }, [book, id]);  

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = async () => {
    // Check if book is upcoming and prevent adding to cart
    if (isUpcoming) {
      setNotification({
        show: true,
        message: `${book.title} is not yet available. It will be released on ${new Date(book.publicationDate).toLocaleDateString()}.`,
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      return;
    }
    
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
      // Check if it's a stock quantity error
      const errorMessage = err.message && err.message.includes('Not enough stock') 
        ? err.message 
        : 'Failed to add book to cart. Please try again.';
        
      setNotification({
        show: true,
        message: errorMessage,
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
              {book.rating > 4 && (
                <div className="absolute top-2 left-2 bg-gold text-navy text-xs font-bold px-2 py-1 rounded">
                  Bestseller
                </div>
              )}
              {isUpcoming && (
                <div className="absolute bottom-0 left-0 right-0 bg-emerald-700 text-white px-3 py-2 text-sm font-bold text-center">
                  Coming: {book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : 'Soon'}
                </div>
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
            <h1 className="text-3xl font-bold text-navy mb-2">
              {book.title}
              {book.isAwardWinning && (
                <span className="inline-flex items-center ml-2 bg-gold text-navy text-sm font-bold px-2 py-1 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Award Winner
                </span>
              )}
            </h1>
            <p className="text-gray mb-4">by {book.authors?.join(', ') || 'Unknown Author'}</p>
            
            {/* Ratings */}
            <div className="flex items-center mb-4">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.floor(book.rating || 4.5) ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-navy">{book.rating || 4.5} ({book.reviewCount || 1289} reviews)</span>
            </div>
            
            {/* Upcoming banner if publication date is in future */}
            {isUpcoming && (
              <div className="bg-emerald-100 border-l-4 border-emerald-700 text-emerald-900 p-4 mb-6 rounded">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {/* Calendar icon */}
                    <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-emerald-900">Coming Soon</h3>
                    <div className="mt-1 text-sm text-emerald-800">
                      <p>This book will be available on {book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : 'a future date'}. Pre-ordering is not available at this time.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
              {isUpcoming ? (
                <button 
                  disabled
                  className="flex items-center bg-gray-400 text-white px-6 py-2 rounded-md cursor-not-allowed"
                  title="Available after release date"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Available on release
                </button>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="flex items-center bg-navy text-white px-6 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </button>
              )}
              
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

        {/* ─── Reviews Section ─────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-navy mb-4">Reviews</h2>

          {reviews.length > 0 ? (
            reviews.map(r => (
              <div key={r.id} className="mb-4 p-4 border rounded">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{r.userName || 'Anonymous'}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-gold mb-1">Rating: {r.rating}/5</div>
                <p className="text-navy">{r.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 mb-6">No reviews yet.</p>
          )}
        </section>
        {/* ─── END REVIEWS ─────────────────────────────────────────────────── */}
      </div>
      
      <Footer />
    </div>
  );
}

export default BookDetails;