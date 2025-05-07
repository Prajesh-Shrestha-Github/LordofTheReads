import api from './api';

// Admin Books API
const bookService = {
  // Get all books
  getAllBooks: async () => {
    try {
      const response = await api.get('/admin/books');
      return response.data;
    } catch (error) {
      console.error('Error fetching all books:', error);
      throw error;
    }
  },

  // Get book details
  getBook: async (id) => {
    try {
      const response = await api.get(`/admin/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error);
      throw error;
    }
  },

  // Create new book
  createBook: async (bookData) => {
    try {
      const response = await api.post('/admin/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Update book
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/admin/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book ${id}:`, error);
      throw error;
    }
  },

  // Delete book
  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/admin/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting book ${id}:`, error);
      throw error;
    }
  }
};

// Admin Authors and Genres API (for use with books)
const authorGenreService = {
  // Get all authors
  getAllAuthors: async () => {
    try {
      const response = await api.get('/authors');
      return response.data;
    } catch (error) {
      console.error('Error fetching authors:', error);
      throw error;
    }
  },

  // Get all genres
  getAllGenres: async () => {
    try {
      const response = await api.get('/genres');
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }
};

// Admin Discounts API
const discountService = {
  // Get all discounts
  getAllDiscounts: async () => {
    try {
      const response = await api.get('/admin/discounts');
      return response.data;
    } catch (error) {
      console.error('Error fetching all discounts:', error);
      throw error;
    }
  },

  // Get discount details
  getDiscount: async (id) => {
    try {
      const response = await api.get(`/admin/discounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching discount ${id}:`, error);
      throw error;
    }
  },

  // Create new discount
  createDiscount: async (discountData) => {
    try {
      const response = await api.post('/admin/discounts', discountData);
      return response.data;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  },

  // Update discount
  updateDiscount: async (id, discountData) => {
    try {
      const response = await api.put(`/admin/discounts/${id}`, discountData);
      return response.data;
    } catch (error) {
      console.error(`Error updating discount ${id}:`, error);
      throw error;
    }
  },

  // Delete discount
  deleteDiscount: async (id) => {
    try {
      const response = await api.delete(`/admin/discounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting discount ${id}:`, error);
      throw error;
    }
  }
};

// Admin Announcements API
const announcementService = {
  // Get all announcements
  getAllAnnouncements: async () => {
    try {
      const response = await api.get('/admin/announcements');
      return response.data;
    } catch (error) {
      console.error('Error fetching all announcements:', error);
      throw error;
    }
  },

  // Get announcement details
  getAnnouncement: async (id) => {
    try {
      const response = await api.get(`/admin/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching announcement ${id}:`, error);
      throw error;
    }
  },

  // Create new announcement
  createAnnouncement: async (announcementData) => {
    try {
      const response = await api.post('/admin/announcements', announcementData);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Update announcement
  updateAnnouncement: async (id, announcementData) => {
    try {
      const response = await api.put(`/admin/announcements/${id}`, announcementData);
      return response.data;
    } catch (error) {
      console.error(`Error updating announcement ${id}:`, error);
      throw error;
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    try {
      const response = await api.delete(`/admin/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting announcement ${id}:`, error);
      throw error;
    }
  }
};

export { bookService, discountService, announcementService, authorGenreService };