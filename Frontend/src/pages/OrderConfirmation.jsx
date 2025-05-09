import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { CheckCircle, Copy, Calendar, Clock } from 'lucide-react';

function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated()) {
          setError('Please login to view your order');
          setLoading(false);
          return;
        }
        
        // Get order from database via API
        const orderData = await orderService.getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [isAuthenticated, orderId]);

  const copyClaimCode = () => {
    if (order?.claimCode) {
      navigator.clipboard.writeText(order.claimCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-navy">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-center text-red-600">
              <h2 className="text-xl font-bold mb-4">Error</h2>
              <p>{error}</p>
              <Link to="/" className="mt-4 inline-block text-navy hover:text-gold transition-colors">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-navy">Order Placed Successfully!</h1>
            <p className="text-gray mb-6">
              Thank you for your order. We've sent a confirmation email with all the details.
            </p>
            <div className="bg-navy/10 rounded-lg p-4 inline-block">
              <div className="flex items-center justify-center">
                <div className="mr-4">
                  <p className="text-sm text-gray mb-1">Your Claim Code:</p>
                  <p className="text-xl font-mono font-bold text-navy tracking-wider">{order?.claimCode}</p>
                </div>
                <button 
                  onClick={copyClaimCode}
                  className="p-2 rounded-full hover:bg-navy/20 transition-colors"
                  title="Copy to clipboard"
                >
                  {codeCopied ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-navy" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-lg font-bold mb-4 text-navy">Order Summary</h2>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-navy">Order #{order?.id}</p>
                <div className="flex items-center text-gray text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Placed on {formatDate(order?.orderDate)}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray mb-1">Total Amount:</p>
                <p className="text-xl font-bold text-navy">${order?.totalAmount.toFixed(2)}</p>
                {order?.discountAmount > 0 && (
                  <p className="text-sm text-green-600">You saved ${order.discountAmount.toFixed(2)}!</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-lg font-bold mb-4 text-navy">Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray">Order Number:</p>
                <p className="font-medium text-navy">#{order?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray">Order Date:</p>
                <p className="font-medium text-navy flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(order?.orderDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray">Status:</p>
                <p className="font-medium text-green-600">
                  {order?.status === 0 ? 'Pending' : 
                   order?.status === 1 ? 'Completed' : 'Cancelled'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray">Total Amount:</p>
                <p className="font-medium text-navy">${order?.totalAmount.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-navy mb-3">Items in your order:</h3>
              
              <div className="space-y-4">
                {order?.orderItems?.map(item => (
                  <div key={item.id} className="flex items-start">
                    <div className="w-12 h-16 flex-shrink-0 mr-4">
                      <img 
                        src={item.bookImageUrl || '/placeholder-book.png'} 
                        alt={item.bookTitle || 'Book cover'} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className="font-medium text-navy">{item.bookTitle}</h4>
                      <p className="text-sm text-gray">{item.authors}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-navy">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Pickup Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-lg font-bold mb-4 text-navy">Pickup Information</h2>
            
            <div className="mb-4">
              <p className="text-navy mb-2">
                <strong>Pickup Location:</strong>
              </p>
              <p className="text-gray">
                Lord of The Reads Bookstore<br />
                123 Book Street<br />
                Kathmandu, Nepal
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-navy mb-2">
                <strong>Store Hours:</strong>
              </p>
              <div className="flex items-center text-gray">
                <Clock className="h-4 w-4 mr-1" />
                <span>Monday - Friday: 10:00 AM - 8:00 PM</span>
              </div>
              <div className="flex items-center text-gray">
                <Clock className="h-4 w-4 mr-1" />
                <span>Saturday - Sunday: 11:00 AM - 6:00 PM</span>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Remember to bring your membership ID and claim code when picking up your order.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link 
              to="/" 
              className="bg-white text-navy border border-navy py-2 px-4 rounded-md font-medium hover:bg-navy hover:text-white transition-colors text-center"
            >
              Continue Shopping
            </Link>
            
            <Link 
              to="/orders" 
              className="bg-navy text-white py-2 px-4 rounded-md font-medium hover:bg-gold hover:text-navy transition-colors text-center"
            >
              View All Orders
            </Link>
            
            {order?.status === 0 && (
              <button 
                onClick={async () => {
                  try {
                    await orderService.cancelOrder(order.id);
                    setOrder({...order, status: 2, isCancelled: true, cancellationDate: new Date().toISOString()});
                  } catch (err) {
                    console.error('Error cancelling order:', err);
                    alert('Failed to cancel order. Please try again.');
                  }
                }}
                className="bg-white text-red-600 border border-red-600 py-2 px-4 rounded-md font-medium hover:bg-red-600 hover:text-white transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OrderConfirmation;
