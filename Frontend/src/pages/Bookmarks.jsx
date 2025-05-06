// src/pages/Bookmarks.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getBookmarks, removeBookmark, clearAllBookmarks } from '../services/bookmarkService';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  
  useEffect(() => {
    // Load bookmarks when component mounts
    setBookmarks(getBookmarks());
  }, []);
  
  const handleRemoveBookmark = (bookId) => {
    const updatedBookmarks = removeBookmark(bookId);
    setBookmarks(updatedBookmarks);
  };
  
  const handleClearAll = () => {
    const clearedBookmarks = clearAllBookmarks();
    setBookmarks(clearedBookmarks);
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
        
        {bookmarks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-navy mb-4">You haven't bookmarked any books yet.</p>
            <Link to="/books" className="bg-gold hover:bg-gold-dark text-navy px-4 py-2 rounded-md text-sm transition-colors">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bookmarks.map(book => (
              <div key={book.id} className="relative">
                <div className="bg-white rounded-md overflow-hidden shadow-md">
                  <div className="relative">
                    <img 
                      src={book.coverImageUrl || `https://placehold.co/300x450?text=${encodeURIComponent(book.title)}`}
                      alt={book.title}
                      className="w-full aspect-[2/3] object-contain"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/300x450/e2e8f0/1e293b?text=No+Cover`;
                      }}
                    />
                    <button 
                      onClick={() => handleRemoveBookmark(book.id)}
                      className="absolute top-2 right-2 bg-white p-1 rounded-full text-gold hover:text-navy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-navy mb-1">{book.title}</h3>
                    <p className="text-xs text-gray mb-2">{book.authors?.join(', ')}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-navy">${book.price.toFixed(2)}</span>
                      <Link 
                        to={`/books/${book.id}`}
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