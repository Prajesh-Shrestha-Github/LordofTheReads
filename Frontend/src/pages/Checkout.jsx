import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import orderService from '../services/orderService';

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated()) {
          navigate('/login', { state: { from: '/checkout' } });
          return;
        }
        
        // Get cart from database via API
        const cartData = await cartService.getCart();
        
        if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
          navigate('/cart');
          return;
        }
        
        setCart(cartData);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [isAuthenticated, navigate]);

  // Calculate subtotal using the price from CartItem (which includes any discounts)
  const subtotal = cart?.cartItems?.reduce((total, item) => 
    total + (item.price || item.book?.price || 0) * item.quantity, 0) || 0;
  
  // Calculate if eligible for 5% discount (5 or more books)
  const totalBooks = cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  const isEligibleForQuantityDiscount = totalBooks >= 5;
  const quantityDiscountAmount = isEligibleForQuantityDiscount ? subtotal * 0.05 : 0;
  
  // Check for loyalty discount (10%)
  const hasLoyaltyDiscount = cart?.discountAmount > 0 && cart?.discountType === 'Loyalty Discount';
  const loyaltyDiscountAmount = hasLoyaltyDiscount ? cart?.discountAmount : 0;
  
  // Total after all discounts
  const total = subtotal - quantityDiscountAmount - loyaltyDiscountAmount;

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      console.log('Attempting to create order...');
      
      // Create order via API
      const order = await orderService.createOrder();
      
      console.log('Order created successfully:', order);
      
      // Navigate to order confirmation page
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      
      // Provide more detailed error information
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        
        if (err.response.status === 401) {
          setError('Authentication error. Please log in again.');
        } else if (err.response.status === 404) {
          setError('API endpoint not found. Please contact support.');
        } else if (err.response.status === 400) {
          // Handle stock availability errors
          // Check if the response data is a string
          const errorMessage = typeof err.response.data === 'string'
            ? err.response.data
            : (err.response.data?.message || JSON.stringify(err.response.data));
            
          // Check if it's a stock availability error
          if (typeof errorMessage === 'string' && errorMessage.includes('Not enough stock')) {
            setError(`Server error: ${err.response.status}. ${errorMessage}`);
          } else {
            setError(`Server error: ${err.response.status}. ${errorMessage}`);
          }
        } else {
          setError(`Server error: ${err.response.status}. ${err.response.data?.message || 'Please try again.'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request made but no response received:', err.request);
        setError('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError(`Error: ${err.message}`);
      }
      
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-navy">Loading checkout...</p>
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
        <h1 className="text-2xl font-bold mb-8 text-navy">Checkout</h1>
        
        {/* Stock Availability Alert - Display above the order summary */}
        {error && typeof error === 'string' && error.includes('Not enough stock') && (
          <div className="mb-6 bg-amber-50 border border-amber-300 p-3 rounded-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-amber-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-amber-800">
                {(() => {
                  const match = error.match(/Not enough stock for '([^']+)'. Only (\d+) available/);
                  if (match) {
                    const [_, bookTitle, availableQty] = match;
                    return `Not enough copies of "${bookTitle}". Only ${availableQty} available.`;
                  }
                  return error.replace('Server error: 400. ', '');
                })()}
              </span>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="ml-auto bg-amber-100 px-2 py-1 rounded text-sm text-amber-700 hover:bg-amber-200"
              >
                Return to Cart
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold mb-4 text-navy">Order Summary</h2>
              
              {cart?.cartItems?.map(item => (
                <div key={item.bookId} className="flex items-center py-4 border-b border-gray-200 last:border-0">
                  <div className="w-16 h-16 flex-shrink-0 mr-4">
                    <img 
                      src={item.book?.imageUrl || '/placeholder-book.png'} 
                      alt={item.book?.title || 'Book cover'} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium text-navy">{item.book?.title || 'Unknown Book'}</h3>
                    <p className="text-sm text-gray">
                      {item.book?.bookAuthors?.map(ba => ba.author?.name).join(', ') || 'Unknown Author'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {item.price && item.book?.price && item.price < item.book.price ? (
                      <>
                        <div className="font-medium text-navy">${(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-xs text-gray line-through">${(item.book.price * item.quantity).toFixed(2)}</div>
                        <div className="text-xs text-red-600">
                          {Math.round((1 - item.price / item.book.price) * 100)}% off
                        </div>
                        <div className="text-xs text-gray">Qty: {item.quantity}</div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium text-navy">${((item.price || item.book?.price || 0) * item.quantity).toFixed(2)}</div>
                        <div className="text-xs text-gray">Qty: {item.quantity}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pickup Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-navy">Pickup Information</h2>
              
              <div className="mb-6">
                <p className="text-navy mb-2">
                  <strong>Pickup Location:</strong>
                </p>
                <p className="text-gray">
                  Lord of The Reads Bookstore<br />
                  123 Book Street<br />
                  Kathmandu, Nepal
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-navy mb-2">
                  <strong>Pickup Instructions:</strong>
                </p>
                <p className="text-gray">
                  After placing your order, you will receive a confirmation email with a claim code.
                  Present your membership ID and claim code at the store to complete your purchase.
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-navy mb-2">
                  <strong>Store Hours:</strong>
                </p>
                <p className="text-gray">
                  Monday - Friday: 10:00 AM - 8:00 PM<br />
                  Saturday - Sunday: 11:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
              <h2 className="text-lg font-bold mb-4 text-navy">Payment Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-navy">
                  <span>Subtotal ({totalBooks} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {isEligibleForQuantityDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>5% Discount (5+ books)</span>
                    <span>-${quantityDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Show loyalty discount if available */}
                {hasLoyaltyDiscount && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Loyalty Discount (10%)</span>
                    <span>-${loyaltyDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-navy">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray pt-3 mb-6">
                <div className="flex justify-between font-bold text-navy">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={handlePlaceOrder}
                disabled={processing}
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  processing 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-navy text-white hover:bg-gold hover:text-navy'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Place Order'}
              </button>
              
              <p className="text-xs text-center text-gray mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
        
        {error && !error.includes('Not enough stock') && (
          <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Checkout;
