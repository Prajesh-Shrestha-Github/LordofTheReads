import api from './api';
import authService from './authService';

export const getUserReviews = async () => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const response = await api.get('/Reviews/user');
    return response.data;
  } catch (error) {
    console.error('Error in getUserReviews:', error);
    throw error;
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await api.put(`/Reviews/${reviewId}`, reviewData);
    
    // Dispatch a custom event that components can listen for
    const event = new CustomEvent('reviewUpdated', { detail: { reviewId } });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Format date to a more readable format
export const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Generate stars for rating display
export const generateRatingStars = (rating) => {
  return Array(5).fill(0).map((_, i) => i < rating);
};

export const deleteReview = async (reviewId) => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    await api.delete(`/Reviews/${reviewId}`);
    
    // Dispatch a custom event that components can listen for
    const event = new CustomEvent('reviewDeleted', { detail: { reviewId } });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
