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

  // Process (complete) an order
  processOrder: async (orderId, claimCode) => {
    try {
      const response = await api.post(`/staff/orders/${orderId}/process`, { claimCode });
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
