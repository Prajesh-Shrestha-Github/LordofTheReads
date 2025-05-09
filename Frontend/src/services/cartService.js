// src/services/cartService.js
import api from './api';

const cartService = {
  // Get cart items from the database
  getCart: async () => {
    try {
      const response = await api.get('/Cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },
  
  // Add item to cart
  addToCart: async (bookId, quantity = 1, format = null) => {
    try {
      const response = await api.post('/Cart/items', {
        bookId,
        quantity,
        format
      });
      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },
  
  // Update cart item quantity
  updateQuantity: async (bookId, quantity) => {
    try {
      const response = await api.put(`/Cart/items/${bookId}`, {
        quantity
      });
      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },
  
  // Remove item from cart
  removeItem: async (bookId) => {
    try {
      const response = await api.delete(`/Cart/items/${bookId}`);
      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      return response.data;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },
  
  // Clear cart
  clearCart: async () => {
    try {
      const response = await api.delete('/Cart');
      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
  
  // Get cart count (for navbar display)
  getCartCount: async () => {
    try {
      const cart = await cartService.getCart();
      return cart?.cartItems?.length || 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }
};

export default cartService;