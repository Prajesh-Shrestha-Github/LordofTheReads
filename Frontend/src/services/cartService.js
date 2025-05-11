// src/services/cartService.js
import api from './api';

const cartService = {
  // Get cart items from the database
  getCart: async () => {
    try {
      // Check authentication first
      const user = localStorage.getItem('user');
      if (!user) {
        console.log('User not authenticated, skipping cart fetch');
        return { cartItems: [] }; // Return empty cart without making API call
      }

      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { cartItems: [] }; // Return empty cart on error
    }
  },
  
  // Add item to cart
  addToCart: async (bookId, quantity = 1, format = null) => {
    try {
      const response = await api.post('/cart/items', {
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
      const response = await api.put(`/cart/items/${bookId}`, {
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
      const response = await api.delete(`/cart/items/${bookId}`);
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
      const response = await api.delete('/cart');
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
      // Only attempt to get cart if user is authenticated
      const user = localStorage.getItem('user');
      if (!user) {
        // User not logged in, return 0 without calling API
        return 0;
      }
      
      // getCart now handles authentication internally and returns empty cart on error
      const cart = await cartService.getCart();
      return cart?.cartItems?.length || 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }
};

export default cartService;