import axios from 'axios';

// Create axios instance with default config
const API_URL = 'http://localhost:5253/api/admin';
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Admin Books API
const bookService = {
  // Get all books
  getAllBooks: async () => {
    try {
      const response = await instance.get('/books');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get book details
  getBook: async (id) => {
    try {
      const response = await instance.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new book
  createBook: async (bookData) => {
    try {
      const response = await instance.post('/books', bookData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update book
  updateBook: async (id, bookData) => {
    try {
      const response = await instance.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete book
  deleteBook: async (id) => {
    try {
      const response = await instance.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Admin Authors and Genres API (for use with books)
const authorGenreService = {
  // Get all authors
  getAllAuthors: async () => {
    try {
      // Assuming there's an endpoint to get all authors
      const response = await axios.get('http://localhost:5253/api/authors');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all genres
  getAllGenres: async () => {
    try {
      // Assuming there's an endpoint to get all genres
      const response = await axios.get('http://localhost:5253/api/genres');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Admin Discounts API
const discountService = {
  // Get all discounts
  getAllDiscounts: async () => {
    try {
      const response = await instance.get('/discounts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get discount details
  getDiscount: async (id) => {
    try {
      const response = await instance.get(`/discounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new discount
  createDiscount: async (discountData) => {
    try {
      const response = await instance.post('/discounts', discountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update discount
  updateDiscount: async (id, discountData) => {
    try {
      const response = await instance.put(`/discounts/${id}`, discountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete discount
  deleteDiscount: async (id) => {
    try {
      const response = await instance.delete(`/discounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Admin Announcements API
const announcementService = {
  // Get all announcements
  getAllAnnouncements: async () => {
    try {
      const response = await instance.get('/announcements');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get announcement details
  getAnnouncement: async (id) => {
    try {
      const response = await instance.get(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new announcement
  createAnnouncement: async (announcementData) => {
    try {
      const response = await instance.post('/announcements', announcementData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update announcement
  updateAnnouncement: async (id, announcementData) => {
    try {
      const response = await instance.put(`/announcements/${id}`, announcementData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    try {
      const response = await instance.delete(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export { bookService, discountService, announcementService, authorGenreService };
