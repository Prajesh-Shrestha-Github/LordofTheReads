import React, { useEffect, useState } from 'react';
import staffOrderService from '../../services/staffOrderService';
import { X, Loader, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimCode, setClaimCode] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffOrderService.getPendingOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch pending orders';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setClaimCode('');
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
    setClaimCode('');
    setError(null);
  };

  const handleProcess = async () => {
    if (!selectedOrder) return;
    if (!claimCode) {
      setError('Please enter claim code');
      toast.error('Claim code is required');
      return;
    }
    if (claimCode.trim().length < 3) {
      setError('Claim code must be at least 3 characters');
      toast.error('Invalid claim code format');
      return;
    }
    try {
      setProcessingOrder(true);
      setError(null);
      await staffOrderService.processOrder(selectedOrder.id, claimCode, selectedOrder.userId);
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      
      // Show success toast notification
      toast.success(`Order #${selectedOrder.id} processed successfully`);
      
      // Show success message in modal before closing
      setSuccessMessage({
        type: 'success',
        text: 'Order processed successfully!',
        details: `Order #${selectedOrder.id} has been marked as processed with claim code: ${claimCode}`
      });
      
      // Close modal after a delay to show success message
      setTimeout(() => {
        closeModal();
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Error processing order:', err);
      const message = err.response?.data?.message || `Failed to process order ${selectedOrder.id}`;
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    if (!window.confirm(`Are you sure you want to delete order #${selectedOrder.id}? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeletingOrder(true);
      setError(null);
      await staffOrderService.cancelOrder(selectedOrder.id);
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      
      // Show success toast notification
      toast.success(`Order #${selectedOrder.id} deleted successfully`);
      
      // Show success message in modal before closing
      setSuccessMessage({
        type: 'info',
        text: 'Order deleted successfully!',
        details: `Order #${selectedOrder.id} has been deleted from the system`
      });
      
      // Close modal after a delay to show success message
      setTimeout(() => {
        closeModal();
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Error canceling order:', err);
      const message = err.response?.data?.message || `Failed to cancel order ${selectedOrder.id}`;
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setDeletingOrder(false);
    }
  };

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center h-64">
      <Loader className="h-8 w-8 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600">Loading orders...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-6 flex flex-col items-center justify-center h-64">
      <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
      <p className="text-red-600 font-medium mb-4">{error}</p>
      <button 
        onClick={fetchOrders}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No pending orders</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.userName || order.userEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Order #{selectedOrder.id} Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {successMessage && (
                <div className={`mb-4 p-3 ${successMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} rounded-md flex items-start`}>
                  {successMessage.type === 'success' ? 
                    <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /> : 
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  }
                  <div>
                    <p className="font-semibold">{successMessage.text}</p>
                    <p className="text-sm mt-1">{successMessage.details}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                  <p><span className="font-medium">Status:</span> {selectedOrder.status}</p>
                  <p><span className="font-medium">Total Amount:</span> ${selectedOrder.totalAmount.toFixed(2)}</p>
                  {selectedOrder.discountAmount > 0 && (
                    <p><span className="font-medium">Discount Applied:</span> ${selectedOrder.discountAmount.toFixed(2)}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p><span className="font-medium">Name:</span> {selectedOrder.userName}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.userEmail}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.orderItems.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <img 
                                src={item.bookImageUrl} 
                                alt={item.bookTitle} 
                                className="h-12 w-10 object-cover mr-3"
                              />
                              <span>{item.bookTitle}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">{item.authors}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">${item.priceAtPurchase.toFixed(2)}</td>
                          <td className="px-4 py-2">${(item.quantity * item.priceAtPurchase).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Claim Code</h3>
                <input
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  placeholder="Enter claim code"
                  className="border rounded px-3 py-2 w-full"
                />
                <p className="text-sm text-gray-500 mt-1">Enter the claim code to process this order</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={processingOrder || deletingOrder || successMessage}
                  className={`px-4 py-2 flex items-center ${(deletingOrder || processingOrder || successMessage) ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded`}
                >
                  {deletingOrder ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Deleting...
                    </>
                  ) : 'Delete Order'}
                </button>
                <button
                  onClick={handleProcess}
                  disabled={processingOrder || deletingOrder || successMessage}
                  className={`px-4 py-2 flex items-center ${(processingOrder || deletingOrder || successMessage) ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} text-white rounded`}
                >
                  {processingOrder ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : 'Process Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrders;
