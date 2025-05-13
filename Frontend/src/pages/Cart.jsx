import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Minus, Plus, Trash2 } from 'lucide-react';
import cartService from '../services/cartService';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountInfo, setDiscountInfo] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated()) {
          setError('Please login to view your cart');
          setLoading(false);
          return;
        }
        
        // Get cart from database via API
        const cart = await cartService.getCart();
        
        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        // Check if a loyalty discount is included in the cart
        if (cart.discountAmount && cart.discountAmount > 0) {
          console.log('Discount found in cart:', cart.discountAmount, cart.discountType);
          
          setDiscountInfo({
            amount: cart.discountAmount,
            percentage: cart.discountPercentage || 10,
            isLoyaltyDiscount: cart.discountType === 'Loyalty Discount',
            type: cart.discountType
          });
        }
        
        // Transform the data structure to match component expectations
        const formattedItems = cart.cartItems.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
          price: item.price, // Include the price from CartItem (which includes any discounts)
          book: item.book
        }));
        
        setCartItems(formattedItems);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCartItems();
  }, [isAuthenticated]);

  // Calculate subtotal using the price from CartItem (which includes any discounts)
  const subtotal = cartItems.reduce((total, item) => 
    total + (item.price || item.book?.price || 0) * item.quantity, 0);
  
  // Calculate total with loyalty discount if applicable
  const discountValue = discountInfo?.amount || 0;
  const total = Math.max(0, subtotal - discountValue);

  // Handle quantity change
  const updateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Update in database via API
      await cartService.updateQuantity(bookId, newQuantity);
      
      // Update in state
      setCartItems(cartItems.map(item => 
        item.bookId === bookId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      console.error('Error updating cart item quantity:', err);
      
      // Check if it's a stock quantity error
      const errorMessage = err.message && err.message.includes('Not enough stock')
        ? err.message
        : 'Failed to update item quantity. Please try again.';
      
      // Show error to user
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
      
      // Reset the cart display to show accurate quantities
      fetchCartItems();
      
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Handle item removal
  const removeItem = async (bookId) => {
    try {
      // Remove from database via API
      await cartService.removeItem(bookId);
      
      // Remove from state
      setCartItems(cartItems.filter(item => item.bookId !== bookId));
    } catch (err) {
      console.error('Error removing item from cart:', err);
      // Show error to user
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Back to shopping link */}
        <Link to="/" className="text-navy hover:text-gold flex items-center text-sm mb-6 transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </Link>

        <h1 className="text-2xl font-bold mb-8 text-navy">Your Shopping Cart</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-navy">Loading your cart...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link to="/login" className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors">
              Login
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <p className="text-navy mb-4">Your cart is empty</p>
            <Link to="/" className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition-colors">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3 space-y-4">
              {cartItems.map(item => (
                <div key={item.bookId} className="bg-white rounded-lg p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-2">
                    <img 
                      src={item.book?.imageUrl || '/placeholder-book.png'} 
                      alt={item.book?.title || 'Book cover'} 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="md:col-span-4">
                    <h3 className="font-medium text-navy">{item.book?.title || 'Unknown Book'}</h3>
                    <p className="text-sm text-gray">
                      {item.book?.bookAuthors?.map(ba => ba.author?.name).join(', ') || 'Unknown Author'}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="inline-flex items-center border border-gray-200 rounded-md bg-white">
                      <button 
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-navy bg-white transition-colors"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 flex items-center justify-center text-navy font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-navy bg-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-between md:justify-end">
                    <span className="md:hidden text-gray">Price:</span>
                    <div>
                      <div className="font-medium text-navy">${((item.price || item.book?.price || 0) * item.quantity).toFixed(2)}</div>
                      <div className="text-xs text-gray">${(item.price || item.book?.price || 0).toFixed(2)} each</div>
                      {item.price && item.book?.price && item.price < item.book.price && (
                        <div className="text-xs text-red-600 line-through">${item.book.price.toFixed(2)} original</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end">
                    <button 
                      onClick={() => removeItem(item.bookId)}
                      className="text-gray hover:text-gold transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-navy">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-navy">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Show loyalty discount if available */}
                  {discountInfo && discountInfo.isLoyaltyDiscount && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Loyalty Discount (10%)</span>
                      <span>-${discountInfo.amount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  
                </div>
                
                <div className="border-t border-gray pt-3 mb-6">
                  <div className="flex justify-between font-bold text-navy">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-navy text-white py-3 rounded-md font-medium hover:bg-gold hover:text-navy transition-colors"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
                
                
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Cart;