import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Home() {
  // Sample featured books data
  const featuredBooks = [
    { id: 1, title: 'The Fantasy Chronicles 1', author: 'Author Name', price: 19.99 },
    { id: 2, title: 'The Fantasy Chronicles 2', author: 'Author Name', price: 18.99 },
    { id: 3, title: 'The Fantasy Chronicles 3', author: 'Author Name', price: 19.99 },
    { id: 4, title: 'The Fantasy Chronicles 4', author: 'Author Name', price: 21.99 },
  ];

  // Sample testimonials
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

  // Categories
  const categories = [
    { id: 1, name: 'Fantasy' },
    { id: 2, name: 'Science Fiction' },
    { id: 3, name: 'Mystery' },
    { id: 4, name: 'Romance' },
    { id: 5, name: 'Non-Fiction' },
    { id: 6, name: "Children's Books" }
  ];

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredBooks.map(book => (
              <div key={book.id} className="flex flex-col">
                <div className="bg-beige aspect-square mb-3 flex items-center justify-center">
                  {/* Placeholder for book image */}
                  <div className="w-6 h-6 rounded-full bg-white"></div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-navy">{book.title}</h3>
                  <p className="text-xs text-gray">{book.author}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-navy">${book.price.toFixed(2)}</span>
                    <button className="bg-navy text-white text-xs px-3 py-1 rounded-sm hover:bg-gold transition-colors">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default Home;