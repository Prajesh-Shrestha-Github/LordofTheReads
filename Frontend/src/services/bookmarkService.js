// src/services/bookmarkService.js
const BOOKMARKS_KEY = 'bookmarks';

// Get all bookmarks from localStorage
const getBookmarks = () => {
  const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
  return bookmarks ? JSON.parse(bookmarks) : [];
};

// Add a book to bookmarks
const addBookmark = (book) => {
  const bookmarks = getBookmarks();
  
  // Check if book is already bookmarked
  if (!bookmarks.some(bookmark => bookmark.id === book.id)) {
    bookmarks.push(book);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    
    // Dispatch event to update bookmark count in navbar
    window.dispatchEvent(new Event('bookmarksUpdated'));
  }
  
  return bookmarks;
};

// Remove a book from bookmarks
const removeBookmark = (bookId) => {
  const bookmarks = getBookmarks();
  const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookId);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  
  // Dispatch event to update bookmark count in navbar
  window.dispatchEvent(new Event('bookmarksUpdated'));
  
  return updatedBookmarks;
};

// Check if a book is bookmarked
const isBookmarked = (bookId) => {
  const bookmarks = getBookmarks();
  return bookmarks.some(bookmark => bookmark.id === bookId);
};

// Clear all bookmarks
const clearAllBookmarks = () => {
  localStorage.removeItem(BOOKMARKS_KEY);
  
  // Dispatch event to update bookmark count in navbar
  window.dispatchEvent(new Event('bookmarksUpdated'));
  
  return [];
};

export { getBookmarks, addBookmark, removeBookmark, isBookmarked, clearAllBookmarks };