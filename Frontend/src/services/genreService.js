import api from './api';

// Get all genres
const getAllGenres = async () => {
  try {
    const response = await api.get('/genres');
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

// Get books by genre ID
const getBooksByGenre = async (genreId) => {
  try {
    // This endpoint might need to be implemented in the backend
    const response = await api.get(`/book?genreId=${genreId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books for genre ${genreId}:`, error);
    throw error;
  }
};

// Export functions individually
export { getAllGenres, getBooksByGenre };