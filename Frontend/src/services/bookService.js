import axios from 'axios';

const API_URL = 'http://localhost:5253/api';

// Get all books
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/book`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all books:', error);
    throw error;
  }
};

// Get book by ID
const getBookById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/book/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error);
    throw error;
  }
};

// Bookmark a book
const bookmarkBook = async (bookId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post(
      `${API_URL}/bookmark/add/${bookId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error bookmarking book with ID ${bookId}:`, error);
    throw error;
  }
};

// Export all functions as named exports
export { getAllBooks, getBookById, bookmarkBook };

// Also export as default for backward compatibility
const bookService = {
  getAllBooks,
  getBookById,
  bookmarkBook
};

export default bookService;