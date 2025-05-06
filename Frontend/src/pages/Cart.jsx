import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Minus, Plus, Trash2 } from 'lucide-react';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Get cart items from localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (cart.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        // Fetch book details for each cart item
        const itemsWithDetails = await Promise.all(
          cart.map(async (item) => {
            try {
              const response = await fetch(`http://localhost:5253/api/book/${item.bookId}`);
              if (!response.ok) {
                throw new Error(`Failed to fetch book with id ${item.bookId}`);
              }
              const book = await response.json();
              return { ...item, book };
            } catch (err) {
              console.error(`Error fetching book with id ${item.bookId}:`, err);
              return { 
                ...item, 
                book: { 
                  title: 'Unknown Book', 
                  price: 0, 
                  authors: ['Unknown Author'] 
                } 
              };
            }
          })
        );
        
        setCartItems(itemsWithDetails);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCartItems();
  }, []);

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => 
    total + (item.book?.price || 0) * item.quantity, 0);
  
  // Calculate total (no tax)
  const total = subtotal;

  // Handle quantity change
  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Update in state
    setCartItems(cartItems.map(item => 
      item.bookId === bookId ? { ...item, quantity: newQuantity } : item
    ));
    
    // Update in localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.bookId === bookId);
    if (itemIndex !== -1) {
      cart[itemIndex].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Handle item removal
  const removeItem = (bookId) => {
    // Remove from state
    setCartItems(cartItems.filter(item => item.bookId !== bookId));
    
    // Remove from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter(item => item.bookId !== bookId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Dispatch event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
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
          <div className="text-center py-10">Loading cart items...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray mb-4">Your cart is empty</p>
            <Link 
              to="/books" 
              className="bg-navy text-white px-4 py-2 rounded-md inline-block hover:bg-gold transition-colors"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="border-b border-gray pb-4 mb-4 hidden md:grid md:grid-cols-12 text-sm font-medium text-gray">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right"></div>
              </div>

              {cartItems.map(item => (
                <div key={item.bookId} className="border-b border-gray py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6 flex items-center">
                    <div className="w-16 h-20 bg-beige mr-4 flex-shrink-0">
                      {item.book?.coverImageUrl && (
                        <img 
                          src={item.book.coverImageUrl} 
                          alt={item.book.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-navy">{item.book?.title || 'Unknown Book'}</h3>
                      <p className="text-sm text-gray">{item.book?.authors?.join(', ') || 'Unknown Author'}</p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-gray">Quantity:</span>
                    <div className="flex items-center border border-gray rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        className="px-2 py-1 text-gray hover:text-navy"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-navy">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        className="px-2 py-1 text-gray hover:text-navy"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-between md:justify-end">
                    <span className="md:hidden text-gray">Price:</span>
                    <div>
                      <div className="font-medium text-navy">${((item.book?.price || 0) * item.quantity).toFixed(2)}</div>
                      <div className="text-xs text-gray">${(item.book?.price || 0).toFixed(2)} each</div>
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
                
                <button className="w-full bg-navy text-white py-3 rounded-md font-medium hover:bg-gold hover:text-navy transition-colors">
                  Proceed to Checkout
                </button>
                
                <p className="text-xs text-center text-gray mt-4">
                  Free shipping on orders over $50
                </p>
              </div>

              {/* Promo Code */}
              <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-medium mb-3 text-navy">Have a Promo Code?</h3>
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    className="flex-grow px-3 py-2 border border-gray rounded-l-md text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                  <button className="bg-beige text-navy px-4 py-2 rounded-r-md text-sm hover:bg-gold transition-colors">
                    Apply
                  </button>
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

export default Cart;