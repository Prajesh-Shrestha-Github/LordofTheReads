// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });

  // Sample testimonials and categories (keep these)
  const testimonials = [
    {
      id: 1,
      text: '"Lord of the Reads has the best selection of books anywhere. Their customer service is amazing and prices are great, too!"',
      author: 'Sarah Johnson'
    },
    {
      id: 2,
      text: '"The site is so easy to navigate and the quality of books I\'ve received has always been excellent. Will continue shopping here forever!"',
      author: 'William Smith'
    },
    {
      id: 3,
      text: '"Their vast collection is second to none! I found a rare edition I\'d been searching for years. Absolutely thrilled!"',
      author: 'Jennifer Williams'
    }
  ];

  const categories = [
    { id: 1, name: 'Fantasy' },
    { id: 2, name: 'Science Fiction' },
    { id: 3, name: 'Mystery' },
    { id: 4, name: 'Romance' },
    { id: 5, name: 'Non-Fiction' },
    { id: 6, name: "Children's Books" }
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5253/api/book');
        console.log('API Response:', response.data);
        setBooks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books. Please make sure the backend server is running.');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      {/* Navbar Component */}
      <Navbar />

      {/* Fixed Hero Section with improved visibility */}
      <section className="bg-navy text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">One Book to Rule Them All</h1>
          <p className="text-lg md:text-xl mb-8 max-w-lg mx-auto">
            Discover your next adventure in our vast collection of books from fantasy to non-fiction
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/books" className="bg-gold hover:bg-gold-dark text-navy px-6 py-3 rounded-md text-base font-medium transition-colors">Browse Collection</Link>
            <Link to="/signup" className="bg-white hover:bg-beige text-navy px-6 py-3 rounded-md text-base font-medium transition-colors">Sign Up</Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">Featured Books</h2>
          
          {loading ? (
            <div className="text-center py-10">Loading books...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {books.slice(0, 8).map(book => (
                <div key={book.id} className="flex flex-col">
                  <div className="bg-beige aspect-square mb-3 flex items-center justify-center">
                    <img 
                      src={book.coverImageUrl || `https://via.placeholder.com/300x450?text=${encodeURIComponent(book.title)}`}
                      alt={book.title}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-navy">{book.title}</h3>
                    <p className="text-xs text-gray">{book.authors?.join(', ')}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-navy">${book.price.toFixed(2)}</span>
                      <button 
                        onClick={() => {
                          // Add to cart using localStorage
                          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                          const existingItem = cart.find(item => item.bookId === book.id);
                          
                          if (existingItem) {
                            existingItem.quantity += 1;
                          } else {
                            cart.push({ bookId: book.id, quantity: 1 });
                          }
                          
                          localStorage.setItem('cart', JSON.stringify(cart));
                          
                          // Dispatch event to update cart count in navbar
                          window.dispatchEvent(new Event('cartUpdated'));
                          
                          // Show notification
                          setNotification({ 
                            show: true, 
                            message: `${book.title} added to cart!` 
                          });
                          
                          // Hide notification after 3 seconds
                          setTimeout(() => {
                            setNotification({ show: false, message: '' });
                          }, 3000);
                        }}
                        className="bg-navy text-white text-xs px-3 py-1 rounded-sm hover:bg-gold transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link to="/books" className="text-xs border border-gray px-4 py-2 rounded-md hover:bg-beige transition-colors">View All Books</Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-beige">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category.id} className="bg-navy text-white p-6 rounded-md flex items-center justify-center hover:bg-gold hover:text-navy transition-colors">
                <h3 className="text-sm font-medium">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h2 className="text-xl font-bold text-navy mb-4">About Lord of the Reads</h2>
            <p className="text-sm text-navy mb-4">
              Founded in 2020, Lord of the Reads has been a leader in the book industry and literary world wide. Our mission is to connect readers with stories that inspire, educate, and entertain.
            </p>
            <p className="text-sm text-navy mb-4">
              We have over 20,000 books in stock, ranging from rare first editions to contemporary bestsellers, and we're always happy to help you find the perfect book for your next read.
            </p>
            <button className="text-xs bg-gold text-navy px-4 py-2 rounded-md hover:bg-gold-dark transition-colors">Learn More</button>
          </div>
          <div className="md:w-1/2 bg-beige p-6 rounded-md">
            <h3 className="text-lg font-medium text-navy mb-4">Contact Us</h3>
            <form className="space-y-6">
              <input type="email" placeholder="Your email" className="w-full px-3 py-2 border border-gray rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold" />
              <button className="bg-gold hover:bg-gold-dark text-navy px-4 py-2 rounded-md text-sm w-full transition-colors">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-beige">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="p-4 bg-white border border-gray rounded-md hover:shadow-md transition-shadow">
                <p className="text-sm italic text-navy mb-2">{testimonial.text}</p>
                <p className="text-xs font-medium text-gray">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-navy mb-4">Join Our Reading Circle</h2>
          <p className="text-sm text-navy mb-6 max-w-lg mx-auto">
            Subscribe to our newsletter for book recommendations, author interviews, and exclusive offers.
          </p>
          <div className="flex justify-center">
            <div className="flex w-full max-w-md gap-2">
              <input type="email" placeholder="Your email" className="flex-grow px-3 py-2 border border-gray rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold" />
              <button className="bg-gold hover:bg-gold-dark text-navy px-4 py-2 rounded-md text-sm transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 bg-navy text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fade-in-up">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2 text-gold" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{notification.message}</span>
            <Link 
              to="/cart"
              className="ml-4 text-white hover:text-gold"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default Home;