// src/services/bookmarkService.js
import api from './api';

// Get all bookmarks from the database
const getBookmarks = async () => {
  try {
    const response = await api.get('/Bookmark');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

// Add a book to bookmarks
const addBookmark = async (bookId) => {
  try {
    await api.post(`/Bookmark/${bookId}`);
    // Dispatch event to update bookmark count in navbar
    window.dispatchEvent(new Event('bookmarksUpdated'));
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

// Remove a book from bookmarks
const removeBookmark = async (bookId) => {
  try {
    await api.delete(`/Bookmark/${bookId}`);
    // Dispatch event to update bookmark count in navbar
    window.dispatchEvent(new Event('bookmarksUpdated'));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

// Check if a book is bookmarked
const isBookmarked = async (bookId) => {
  try {
    const response = await api.get(`/Bookmark/check/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

// Clear all bookmarks
const clearAllBookmarks = async () => {
  try {
    await api.delete('/Bookmark');
    // Dispatch event to update bookmark count in navbar
    window.dispatchEvent(new Event('bookmarksUpdated'));
    return true;
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return false;
  }
};

// Get bookmark count (for navbar display)
const getBookmarkCount = async () => {
  try {
    const bookmarks = await getBookmarks();
    return bookmarks.length;
  } catch (error) {
    console.error('Error getting bookmark count:', error);
    return 0;
  }
};

export { 
  getBookmarks, 
  addBookmark, 
  removeBookmark, 
  isBookmarked, 
  clearAllBookmarks,
  getBookmarkCount 
};