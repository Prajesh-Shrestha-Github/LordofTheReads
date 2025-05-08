// Merged Books.jsx with full UI and backend integration + author filter
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    genre: 'all',
    author: 'all', // ✅ new state for author
    price: 'all',
    rating: 'all'
  });
  const [authors, setAuthors] = useState([]); // ✅ list of authors
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 12;

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (filters.genre !== 'all') params.append('genre', filters.genre);
        if (filters.author !== 'all') params.append('author', filters.author); // ✅ add author filter
        if (filters.price !== 'all') {
          if (filters.price === 'under-10') params.append('maxPrice', '10');
          else if (filters.price === '10-20') {
            params.append('minPrice', '10');
            params.append('maxPrice', '20');
          } else if (filters.price === '20-30') {
            params.append('minPrice', '20');
            params.append('maxPrice', '30');
          } else if (filters.price === 'over-30') params.append('minPrice', '30');
        }
        if (filters.rating !== 'all') {
          const minRating = parseInt(filters.rating.split('-')[0]);
          params.append('minRating', minRating);
        }

        if (appliedSearchQuery) params.append('query', appliedSearchQuery);

        switch (sortBy) {
          case 'price-low': params.append('sort', 'price_asc'); break;
          case 'price-high': params.append('sort', 'price_desc'); break;
          case 'newest': params.append('sort', 'date_desc'); break;
          case 'rating': params.append('sort', 'rating'); break;
          case 'title-asc': params.append('sort', 'title_asc'); break;
          case 'title-desc': params.append('sort', 'title_desc'); break;
          default: params.append('sort', 'popularity'); break;
        }

        params.append('page', currentPage);
        params.append('pageSize', booksPerPage);

        const response = await axios.get(`http://localhost:5253/api/books/search?${params.toString()}`);
        const { books: fetchedBooks, totalPages } = response.data;

        setBooks(fetchedBooks);
        setTotalPages(totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books.');
        setLoading(false);
      }
    };

    fetchBooks();
  }, [appliedSearchQuery, filters, sortBy, currentPage]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get('http://localhost:5253/api/authors'); // ✅ assumes this endpoint exists
        setAuthors(response.data);
      } catch (err) {
        console.error('Error fetching authors:', err);
      }
    };
    fetchAuthors();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-beige">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="mb-4">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="border border-gray-300 px-4 py-2 rounded-md"
          />
          <button type="submit" className="ml-2 px-4 py-2 bg-navy text-white rounded-md">Search</button>
        </form>

        <div className="mb-4 flex gap-4 flex-wrap">
          <select onChange={(e) => handleFilterChange('genre', e.target.value)} value={filters.genre} className="px-4 py-2 border rounded-md">
            <option value="all">All Genres</option>
            <option value="1">Fiction</option>
            <option value="2">Fantasy</option>
          </select>

          <select onChange={(e) => handleFilterChange('author', e.target.value)} value={filters.author} className="px-4 py-2 border rounded-md">
            <option value="all">All Authors</option>
            {authors.map(author => (
              <option key={author.id} value={author.id}>{author.name}</option>
            ))}
          </select>

          <select onChange={(e) => handleFilterChange('price', e.target.value)} value={filters.price} className="px-4 py-2 border rounded-md">
            <option value="all">All Prices</option>
            <option value="under-10">Under $10</option>
            <option value="10-20">$10 - $20</option>
            <option value="20-30">$20 - $30</option>
            <option value="over-30">Over $30</option>
          </select>

          <select onChange={(e) => handleFilterChange('rating', e.target.value)} value={filters.rating} className="px-4 py-2 border rounded-md">
            <option value="all">All Ratings</option>
            <option value="4-up">4 & Up</option>
            <option value="3-up">3 & Up</option>
            <option value="2-up">2 & Up</option>
            <option value="1-up">1 & Up</option>
          </select>

          <select onChange={(e) => setSortBy(e.target.value)} value={sortBy} className="px-4 py-2 border rounded-md">
            <option value="popularity">Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="rating">Rating</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
          </select>
        </div>

        {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map(book => (
              <div key={book.id} className="bg-white shadow-md rounded-md overflow-hidden">
                <img src={book.imageUrl} alt={book.title} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <h2 className="text-lg font-bold text-navy mb-2">{book.title}</h2>
                  <p className="text-sm text-gray-600 mb-1">{book.authors?.join(', ')}</p>
                  <p className="text-sm text-gray-800 font-semibold">${book.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${page === currentPage ? 'bg-navy text-white' : 'bg-gray-200'}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Books;
