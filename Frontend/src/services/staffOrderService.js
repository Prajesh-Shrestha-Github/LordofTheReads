import api from './api';

const staffOrderService = {
  // Get all pending orders for staff
  getPendingOrders: async () => {
    try {
      const response = await api.get('/staff/orders/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  },

  // Get all processed orders for staff
  getProcessedOrders: async () => {
    try {
      const response = await api.get('/staff/orders/processed');
      return response.data;
    } catch (error) {
      console.error('Error fetching processed orders:', error);
      throw error;
    }
  },

  // Process (complete) an order
  processOrder: async (orderId, claimCode, userId) => {
    try {
      const response = await api.post(`/staff/orders/${orderId}/process`, {
        claimCode,
        userId
      });
      return response.data;
    } catch (error) {
      console.error(`Error processing order ${orderId}:`, error);
      throw error;
    }
  },

  // Cancel (delete) an order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.post(`/staff/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }
};

export default staffOrderService;
