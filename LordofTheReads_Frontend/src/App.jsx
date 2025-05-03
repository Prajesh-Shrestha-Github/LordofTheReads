import { useState } from 'react'
import './App.css'

function App() {
  // Sample featured books
  const featuredBooks = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 12.99, imageUrl: 'https://placehold.co/200x300?text=Book+Cover' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 14.99, imageUrl: 'https://placehold.co/200x300?text=Book+Cover' },
    { id: 3, title: '1984', author: 'George Orwell', price: 10.99, imageUrl: 'https://placehold.co/200x300?text=Book+Cover' },
    { id: 4, title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 15.99, imageUrl: 'https://placehold.co/200x300?text=Book+Cover' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Lord of The Reads</h1>
            <div className="hidden md:flex space-x-4">
              <a href="#" className="hover:text-blue-200">Home</a>
              <a href="#" className="hover:text-blue-200">Books</a>
              <a href="#" className="hover:text-blue-200">Categories</a>
              <a href="#" className="hover:text-blue-200">New Releases</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search books..."
                className="px-4 py-2 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">Login</button>
            <button className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-md">Register</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-12">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-4 text-center">Welcome to Lord of The Reads</h2>
          <p className="text-xl mb-8 text-center max-w-2xl">Your premier destination for books of all genres. Discover new worlds through the pages of our carefully curated collection.</p>
          <button className="bg-white text-blue-800 hover:bg-blue-100 px-6 py-3 rounded-lg font-semibold">Browse Collection</button>
        </div>
      </div>

      {/* Featured Books */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Books</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredBooks.map(book => (
            <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img src={book.imageUrl} alt={book.title} className="w-full h-56 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
                <p className="text-gray-600 mb-2">{book.author}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-800 font-bold">${book.price.toFixed(2)}</span>
                  <button className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-6">Stay updated with new releases, exclusive offers, and literary news.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-800 text-white px-6 py-2 rounded-md hover:bg-blue-700">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Lord of The Reads</h3>
              <p className="text-gray-400">Your premier destination for books of all genres.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Books</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Categories</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Shipping Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Return Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Lord of The Reads. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
