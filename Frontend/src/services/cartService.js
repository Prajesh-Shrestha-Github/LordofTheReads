// src/services/cartService.js
const CART_KEY = 'cart';

// Get cart items
const getCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return cart;
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

// Add item to cart
const addToCart = (bookId, quantity = 1) => {
  try {
    const cart = getCart();
    const existingItem = cart.find(item => item.bookId === bookId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ bookId, quantity });
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    
    // Dispatch event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    return cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return [];
  }
};

// Update cart item quantity
const updateCartItem = (bookId, quantity) => {
  try {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.bookId !== bookId);
    
    if (quantity > 0) {
      updatedCart.push({ bookId, quantity });
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    
    // Dispatch event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    return updatedCart;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return [];
  }
};

// Remove item from cart
const removeFromCart = (bookId) => {
  try {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.bookId !== bookId);
    
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    
    // Dispatch event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    return updatedCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return [];
  }
};

// Clear cart
const clearCart = () => {
  try {
    localStorage.removeItem(CART_KEY);
    
    // Dispatch event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    return [];
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};