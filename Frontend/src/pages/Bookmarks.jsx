// src/pages/Bookmarks.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getBookmarks, removeBookmark, clearAllBookmarks } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Load bookmarks when component mounts
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated()) {
          setError('Please login to view your bookmarks');
          setLoading(false);
          return;
        }
        
        const data = await getBookmarks();
        setBookmarks(data);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [isAuthenticated]);
  
  const handleRemoveBookmark = async (bookId) => {
    try {
      await removeBookmark(bookId);
      // Update the UI by removing the bookmark
      setBookmarks(bookmarks.filter(bookmark => bookmark.bookId !== bookId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('Failed to remove bookmark. Please try again.');
    }
  };
  
  const handleClearAll = async () => {
    try {
      await clearAllBookmarks();
      setBookmarks([]);
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      alert('Failed to clear bookmarks. Please try again.');
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-beige">
      {/* Navbar Component */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-navy hover:text-gold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-navy">Your Bookmarks</h1>
          {bookmarks.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-navy">Loading your bookmarks...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link to="/login" className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors">
              Login
            </Link>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-navy mb-4">You haven't bookmarked any books yet.</p>
            <Link to="/books" className="bg-gold hover:bg-gold-dark text-navy px-4 py-2 rounded-md text-sm transition-colors">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bookmarks.map(bookmark => (
              <div key={bookmark.id} className="relative">
                <div className="bg-white rounded-md overflow-hidden shadow-md">
                  <div className="relative">
                    <img 
                      src={bookmark.book.imageUrl || `https://via.placeholder.com/300x450?text=${encodeURIComponent(bookmark.book.title)}`}
                      alt={bookmark.book.title}
                      className="w-full aspect-[2/3] object-contain"
                    />
                    <button 
                      onClick={() => handleRemoveBookmark(bookmark.bookId)}
                      className="absolute top-2 right-2 bg-white p-1 rounded-full text-gold hover:text-navy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-navy mb-1">{bookmark.book.title}</h3>
                    <p className="text-xs text-gray mb-2">{bookmark.book.bookAuthors?.map(ba => ba.author?.name).join(', ') || 'Unknown Author'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-navy">${bookmark.book.price.toFixed(2)}</span>
                      <Link 
                        to={`/books/${bookmark.bookId}`}
                        className="text-xs text-gold hover:text-navy"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-grow"></div>
      
      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default Bookmarks;