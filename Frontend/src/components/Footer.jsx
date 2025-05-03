import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-navy text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-gold" />
              <span className="text-sm font-bold">Lord of the Reads</span>
            </div>
            <p className="text-xs text-gray mb-2">Your journey through pages begins here</p>
            <div className="flex gap-2">
              <a href="#" className="text-xs text-gray hover:text-white transition-colors">F</a>
              <a href="#" className="text-xs text-gray hover:text-white transition-colors">T</a>
              <a href="#" className="text-xs text-gray hover:text-white transition-colors">I</a>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-medium mb-3">Quick Links</h3>
              <ul className="space-y-1">
                <li><Link to="/" className="text-xs text-gray hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/books" className="text-xs text-gray hover:text-white transition-colors">Books</Link></li>
                <li><Link to="/categories" className="text-xs text-gray hover:text-white transition-colors">Categories</Link></li>
                <li><Link to="/about" className="text-xs text-gray hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Customer Service</h3>
              <ul className="space-y-1">
                <li><Link to="/contact" className="text-xs text-gray hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="text-xs text-gray hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/shipping" className="text-xs text-gray hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link to="/returns" className="text-xs text-gray hover:text-white transition-colors">Returns & Refunds</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Contact Information</h3>
              <address className="not-italic text-xs text-gray">
                <p>123 Bookworm Lane</p>
                <p>Literary District, LR 12345</p>
                <p className="mt-2">
                  <a href="mailto:info@lordofthereads.com" className="hover:text-white transition-colors">info@lordofthereads.com</a>
                </p>
                <p>
                  <a href="tel:+15551234567" className="hover:text-white transition-colors">+1 (555) 123-4567</a>
                </p>
              </address>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-700 text-center">
          <p className="text-xs text-gray">
            &copy; {new Date().getFullYear()} Lord of the Reads. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;