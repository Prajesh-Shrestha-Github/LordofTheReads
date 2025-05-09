import React, { useEffect, useState } from 'react';
import staffOrderService from '../../services/staffOrderService';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimCodes, setClaimCodes] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await staffOrderService.getPendingOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      setError('Failed to fetch pending orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleProcess = async (orderId) => {
    const code = claimCodes[orderId] || '';
    if (!code) {
      setError('Please enter claim code');
      return;
    }
    try {
      await staffOrderService.processOrder(orderId, code);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setClaimCodes(prev => { const next = { ...prev }; delete next[orderId]; return next; });
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || `Failed to process order ${orderId}`;
      setError(message);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await staffOrderService.cancelOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setClaimCodes(prev => { const next = { ...prev }; delete next[orderId]; return next; });
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || `Failed to cancel order ${orderId}`;
      setError(message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No pending orders</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.userName || order.userEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="text"
                      value={claimCodes[order.id] || ''}
                      onChange={(e) => setClaimCodes({ ...claimCodes, [order.id]: e.target.value })}
                      placeholder="Enter code"
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                    <button
                      onClick={() => handleProcess(order.id)}
                      className="text-white bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded"
                    >
                      Process
                    </button>
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingOrders;
