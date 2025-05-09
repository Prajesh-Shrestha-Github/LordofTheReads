// src/services/orderService.js
import api from './api';

const orderService = {
  // Create a new order from the user's cart
  createOrder: async () => {
    try {
      const response = await api.post('/order');
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // Get a specific order by ID
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },
  
  // Get all orders for the current user
  getUserOrders: async () => {
    try {
      const response = await api.get('/order');
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
  
  // Cancel an order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.post(`/order/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }
};

export default orderService;
