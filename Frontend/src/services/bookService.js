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
    // Get all books and filter client-side for reliable search
    const response = await api.get('/book');
    const allBooks = response.data;
    
    // If no query, return all books
    if (!query || query.trim() === '') {
      return allBooks;
    }
    
    // Filter books by search query (case-insensitive)
    const searchTerm = query.toLowerCase();
    const filteredBooks = allBooks.filter(book => {
      return (
        // Search in title
        (book.title && book.title.toLowerCase().includes(searchTerm)) ||
        // Search in description
        (book.description && book.description.toLowerCase().includes(searchTerm)) ||
        // Search in authors
        (book.authors && book.authors.some(author => 
          author.toLowerCase().includes(searchTerm)
        )) ||
        // Search in genres
        (book.genres && book.genres.some(genre => 
          genre.toLowerCase().includes(searchTerm)
        ))
      );
    });
    
    console.log(`Found ${filteredBooks.length} books matching "${query}"`);
    return filteredBooks;
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
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Get book categories
const getCategories = async () => {
  try {
    const response = await api.get('/books/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching book categories:', error);
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

// Get bestsellers based on sales data
const getBestsellers = async (count = 5) => {
  try {
    const response = await api.get(`/book/bestsellers?count=${count}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    throw error;
  }
};

// Get reviews for a specific book
const getBookReviews = async bookId => {
  try {
    const { data } = await api.get(`/Books/${bookId}/reviews`);
    return data;
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    throw error;
  }
};

// Check if user can review a book
const canReviewBook = async (bookId, token) => {
  try {
    // Keep the bearer token in the request as it might be needed for authorization
    const response = await api.get(
      `/Books/can-review/${bookId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.canReview;
  } catch (error) {
    console.error(`Error checking canReview for book with ID ${bookId}:`, error);
    return false;
  }
};

// Post a review for a book
const postReview = async (bookId, dto) => {
  try {
    // Ensure dto has the required fields
    if (!dto.rating || !dto.comment) {
      throw new Error('Rating and comment are required');
    }
    
    // Create proper review request dto
    const reviewData = {
      rating: dto.rating,
      comment: dto.comment
    };
    
    const response = await api.post(`/Books/${bookId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`Error posting review for book ${bookId}:`, error);
    throw error;
  }
};

// Export all functions as named exports
export { getAllBooks, getBookById, bookmarkBook, searchBooks, filterBooks, getCategories, getBestsellers, getBookReviews, canReviewBook, postReview };

// Also export as default for backward compatibility
const bookService = {
  getAllBooks,
  getBookById,
  bookmarkBook,
  searchBooks,
  filterBooks,
  getCategories,
  getBestsellers,
  getBookReviews,
  canReviewBook,
  postReview
};

export default bookService;