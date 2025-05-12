import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, StarOff, Pencil, Trash2, ChevronDown, Filter, ArrowUpDown } from 'lucide-react';
import { getUserReviews, updateReview, deleteReview, formatReviewDate } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const [filterRating, setFilterRating] = useState('All Ratings');
  const [sortBy, setSortBy] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  
  // Filter options
  const filterOptions = ['All Ratings', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];
  
  // Sort options
  const sortOptions = ['Newest First', 'Oldest First', 'Highest Rating', 'Lowest Rating'];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!isAuthenticated()) {
          setError('You must be logged in to view your reviews.');
          setLoading(false);
          return;
        }

        const data = await getUserReviews();
        setReviews(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load your reviews. Please try again later.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isAuthenticated]);

  // Generate stars for display
  const displayStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        strokeWidth={1.5}
        className={`h-6 w-6 ${i < rating ? 'fill-gold text-gold' : 'text-gray-400 fill-transparent'}`} 
      />
    ));
  };
  
  // Apply filters and sorting to reviews
  const filteredAndSortedReviews = () => {
    let result = [...reviews];
    
    // Apply rating filter
    if (filterRating !== 'All Ratings') {
      const ratingValue = parseInt(filterRating);
      result = result.filter(review => review.rating === ratingValue);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(review => 
        review.book.title.toLowerCase().includes(query) || 
        (review.comment && review.comment.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'Newest First':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'Oldest First':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'Highest Rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'Lowest Rating':
        result.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return result;
  };

    const handleEditClick = (review) => {
    setEditingReview(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditRating(5);
    setEditComment('');
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
        await deleteReview(reviewId);
        
        // Update the reviews in state by removing the deleted review
        setReviews(reviews.filter(review => review.id !== reviewId));
        toast.success('Review deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review. Please try again.');
    }
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      await updateReview(reviewId, {
        rating: editRating,
        comment: editComment.trim() || null
      });
      
      // Update the reviews in state
      setReviews(reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            rating: editRating,
            comment: editComment.trim() || null
          };
        }
        return review;
      }));
      
      setEditingReview(null);
      toast.success('Review updated successfully!');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
          <div className="text-center">
            <Link to="/login" className="text-gold hover:underline">
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  const processedReviews = filteredAndSortedReviews();
  
  if (reviews.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <h1 className="text-2xl font-bold text-navy mb-2">My Reviews</h1>
          <p className="text-sm text-gray-600 mb-6">Manage and view all your book reviews</p>
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <h2 className="text-xl font-medium text-navy mb-2">No Reviews Yet</h2>
            <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
            <Link 
              to="/books" 
              className="inline-block bg-gold text-navy font-medium py-2 px-4 rounded-md hover:bg-navy hover:text-gold transition-colors"
            >
              Browse Books to Review
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy mb-2">My Reviews</h1>
          <p className="text-sm text-gray-600">Manage and view all your book reviews</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative inline-block text-left">
            <div className="flex items-center px-3 py-2">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm mr-1">Filter by:</span>
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  className="flex items-center text-sm font-medium text-navy bg-transparent px-4 py-1 rounded border border-gray-200 focus:outline-none"
                  onClick={() => document.getElementById('filter-dropdown').classList.toggle('hidden')}
                >
                  {filterRating}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div 
                  id="filter-dropdown"
                  className="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-md border border-gray-200 bg-white z-10"
                >
                  <div className="py-1">
                    {filterOptions.map((option, index) => (
                      <button
                        key={option}
                        className={`${option === filterRating ? 'text-navy font-medium' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:text-gold bg-transparent ${index !== 0 ? 'border-t border-gray-100' : ''}`}
                        onClick={() => {
                          setFilterRating(option);
                          document.getElementById('filter-dropdown').classList.add('hidden');
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reviews..."
                className="border border-gray-200 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute right-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
            
            <div className="relative inline-block text-left">
              <div className="flex items-center px-3 py-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm mr-1">Sort by:</span>
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    className="flex items-center text-sm font-medium text-navy bg-transparent px-4 py-1 rounded border border-gray-200 focus:outline-none"
                    onClick={() => document.getElementById('sort-dropdown').classList.toggle('hidden')}
                  >
                    {sortBy}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div 
                    id="sort-dropdown"
                    className="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-md border border-gray-200 bg-white z-10"
                  >
                    <div className="py-1">
                      {sortOptions.map((option, index) => (
                        <button
                          key={option}
                          className={`${option === sortBy ? 'text-navy font-medium' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:text-gold bg-transparent ${index !== 0 ? 'border-t border-gray-100' : ''}`}
                          onClick={() => {
                            setSortBy(option);
                            document.getElementById('sort-dropdown').classList.add('hidden');
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {processedReviews.length === 0 ? (
            <div className="bg-gray-50 rounded-md p-6 text-center">
              <p className="text-gray-500">No reviews match your search or filter criteria.</p>
            </div>
          ) : (
            processedReviews.map((review) => (
              <div key={review.id} className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start">
                    <div className="sm:w-32 mb-4 sm:mb-0 sm:mr-6">
                      <Link to={`/book/${review.book.id}`}>
                        <img 
                          src={review.book.imageUrl || '/images/placeholder-book.png'} 
                          alt={review.book.title}
                          className="w-full h-auto object-cover rounded shadow-sm hover:opacity-90 transition-opacity"
                        />
                      </Link>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center mb-1">
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  strokeWidth={1.5}
                                  className={`h-6 w-6 ${i < review.rating ? 'fill-gold text-gold' : 'text-gray-400 fill-transparent'}`} 
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-xs text-gray-500">
                              {review.rating} out of 5 stars
                            </span>
                          </div>
                          <Link 
                            to={`/book/${review.book.id}`} 
                            className="font-medium text-navy hover:text-gold transition-colors"
                          >
                            {review.book.title}
                          </Link>
                          <p className="text-xs text-gray-600">
                            by {review.book.authors.map(a => a.name).join(', ')}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          Posted on {formatReviewDate(review.createdAt)}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        {editingReview === review.id ? (
                          <div className="mb-4">
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-navy mb-1">Rating</label>
                              <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="focus:outline-none p-1 rounded-sm hover:bg-gray-50 transition-colors"
                                  >
                                    <Star 
                                      strokeWidth={1.5}
                                      className={`h-6 w-6 ${star <= editRating ? 'fill-gold text-gold' : 'text-gray-400 fill-transparent'}`} 
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-navy mb-1">Your Review</label>
                              <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                                rows="3"
                                placeholder="Write your review here..."
                              ></textarea>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-xs text-gray-600 bg-transparent hover:text-navy border border-gray-200 rounded transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(review.id)}
                                className="px-3 py-1 text-xs text-navy bg-transparent hover:text-gold border border-gray-200 rounded transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {review.comment ? (
                              <p className="text-navy">{review.comment}</p>
                            ) : (
                              <p className="text-gray-500 italic">No written review provided</p>
                            )}
                          </>
                        )}
                      </div>
                      
                      {editingReview !== review.id && (
                        <div className="mt-4 flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEditClick(review)}
                            className="inline-flex items-center text-xs text-navy bg-transparent hover:text-gold px-3 py-1 rounded border border-gray-200 transition-colors"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                          <button 
                            className="inline-flex items-center text-xs text-red-600 bg-transparent hover:text-red-800 px-3 py-1 rounded border border-gray-200 transition-colors"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}      
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyReviews;
