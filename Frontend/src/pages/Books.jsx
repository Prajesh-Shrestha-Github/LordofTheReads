// Books.jsx with full backend-integrated filtering UI
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Bookmark, ShoppingCart } from 'lucide-react';
import axios from 'axios';

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    genre: 'all',
    author: 'all',
    price: 'all',
    rating: 'all',
    availability: 'all',
    language: 'all',
    format: 'all',
    publisher: 'all'
  });

  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formats, setFormats] = useState([]);
  const [publishers, setPublishers] = useState([]);

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

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== 'all') params.append(key, value);
        });

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
    const fetchFilters = async () => {
      try {
        const [authorRes, genreRes, langRes, formatRes, pubRes] = await Promise.all([
          axios.get('http://localhost:5253/api/authors'),
          axios.get('http://localhost:5253/api/genres'),
          axios.get('http://localhost:5253/api/languages'),
          axios.get('http://localhost:5253/api/formats'),
          axios.get('http://localhost:5253/api/publishers')
        ]);
        setAuthors(authorRes.data);
        setGenres(genreRes.data);
        setLanguages(langRes.data);
        setFormats(formatRes.data);
        setPublishers(pubRes.data);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    fetchFilters();
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

  const handleAddToCart = (book) => {
    console.log(`Add to cart: ${book.title}`);
  };

  const handleBookmarkToggle = (book) => {
    console.log(`Bookmark: ${book.title}`);
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
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <select onChange={(e) => handleFilterChange('author', e.target.value)} value={filters.author} className="px-4 py-2 border rounded-md">
            <option value="all">All Authors</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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

          <select onChange={(e) => handleFilterChange('availability', e.target.value)} value={filters.availability} className="px-4 py-2 border rounded-md">
            <option value="all">All Availability</option>
            <option value="stockOnly">In Stock</option>
            <option value="physicalOnly">Physical Access</option>
          </select>

          <select onChange={(e) => handleFilterChange('language', e.target.value)} value={filters.language} className="px-4 py-2 border rounded-md">
            <option value="all">All Languages</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select onChange={(e) => handleFilterChange('format', e.target.value)} value={filters.format} className="px-4 py-2 border rounded-md">
            <option value="all">All Formats</option>
            {formats.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select onChange={(e) => handleFilterChange('publisher', e.target.value)} value={filters.publisher} className="px-4 py-2 border rounded-md">
            <option value="all">All Publishers</option>
            {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-navy text-white text-sm rounded" onClick={() => handleAddToCart(book)}>
                      <ShoppingCart className="inline w-4 h-4 mr-1" /> Add to Cart
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-navy text-sm rounded" onClick={() => handleBookmarkToggle(book)}>
                      <Bookmark className="inline w-4 h-4 mr-1" /> Wishlist
                    </button>
                  </div>
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