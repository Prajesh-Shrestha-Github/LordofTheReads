import api from './api';

// Get all books
const getAllBooks = async () => {
  try {
    const response = await api.get('/book');
    return response.data;
  } catch (error) {
    console.error('Error fetching all books:', error);
    throw error;
  }
};

// Get book by ID
const getBookById = async (id) => {
  try {
    const response = await api.get(`/book/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error);
    throw error;
  }
};

// Search books by query (title or author)
const searchBooks = async (query) => {
  try {
    // Use the backend filter API with search query
    const response = await api.get('/book/filter', {
      params: { searchQuery: query }
    });
    return response.data.books;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

// Filter books with comprehensive options
const filterBooks = async (filterOptions) => {
  try {
    console.log('Filter options being sent to API:', filterOptions);
    // Send filter options to backend API
    const response = await api.get('/book/filtered', {
      params: filterOptions
    });
    console.log('Successful response from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error filtering books:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
    } else if (error.request) {
      console.error('Request was made but no response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Bookmark a book
const bookmarkBook = async (bookId) => {
  try {
    // No need to manually handle token as api.js interceptor does this
    const response = await api.post(`/bookmark/add/${bookId}`, {});
    
    return response.data;
  } catch (error) {
    console.error(`Error bookmarking book with ID ${bookId}:`, error);
    throw error;
  }
};

// Export all functions as named exports
export { getAllBooks, getBookById, bookmarkBook, searchBooks, filterBooks };

// Also export as default for backward compatibility
const bookService = {
  getAllBooks,
  getBookById,
  bookmarkBook,
  searchBooks,
  filterBooks
};

export default bookService;