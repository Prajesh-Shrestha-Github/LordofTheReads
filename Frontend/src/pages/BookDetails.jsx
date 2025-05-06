import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Bookmark } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import bookService from '../services/bookService';
import cartService from '../services/cartService';
import { addBookmark, isBookmarked } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const data = await bookService.getBookById(id);
        setBook(data);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id]);
  
  // Check if book is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (isAuthenticated() && book) {
        try {
          const bookmarked = await isBookmarked(book.id);
          setIsBookmarked(bookmarked);
        } catch (err) {
          console.error('Error checking bookmark status:', err);
        }
      }
    };
    
    checkBookmarkStatus();
  }, [book, isAuthenticated]);
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    try {
      await cartService.addToCart(book.id, quantity);
      // Dispatch custom event to update cart count in navbar
      window.dispatchEvent(new CustomEvent('cart-updated'));
      alert('Book added to cart successfully!');
    } catch (err) {
      console.error('Error adding book to cart:', err);
      alert('Failed to add book to cart. Please try again.');
    }
  };
  
  const handleBookmark = async () => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    try {
      await addBookmark(book.id);
      setIsBookmarked(true);
      // Dispatch custom event to update bookmark count in navbar
      window.dispatchEvent(new CustomEvent('bookmarksUpdated'));
      alert('Book bookmarked successfully!');
    } catch (err) {
      console.error('Error bookmarking book:', err);
      alert('Failed to bookmark book. Please try again.');
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
              {book.rating > 4 && (
                <div className="absolute top-2 left-2 bg-gold text-navy text-xs font-bold px-2 py-1 rounded">
                  Bestseller
                </div>
              )}
              <img 
                src={book.coverImageUrl || '/placeholder-book.png'} 
                alt={book.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          {/* Book details */}
          <div className="md:w-2/3 lg:w-3/4">
            <h1 className="text-2xl font-bold text-navy mb-1">{book.title}</h1>
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
            
            {/* Price */}
            <div className="text-xl font-bold text-navy mb-6">${book.price?.toFixed(2)}</div>
            
            {/* Description */}
            <p className="text-navy mb-6">{book.description}</p>
            
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
                  <p className="text-navy">{book.publicationDate || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray text-sm">Pages</p>
                  <p className="text-navy">{book.pageCount || 'Unknown'}</p>
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
                  <p className="text-navy">{book.inStock ? 'In Stock' : 'Out of Stock'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default BookDetails;