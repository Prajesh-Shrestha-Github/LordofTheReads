import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookService } from '../../services/adminService';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await bookService.deleteBook(id);
      setBooks(books.filter(book => book.id !== id));
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book. Please try again.');
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (book.publisher && book.publisher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Books Management</h2>
        <Link 
          to="/admin/books/create" 
          className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
        >
          <Plus size={16} className="mr-1" /> Add Book
        </Link>
      </div>

      {error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search books by title, ISBN, or publisher..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-full focus:ring-teal-400 focus:border-teal-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No books found.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-12 w-12">
                        {book.imageUrl ? (
                          <img 
                            className="h-12 w-12 rounded-md object-cover" 
                            src={book.imageUrl} 
                            alt={book.title} 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{book.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{book.isbn || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">${book.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        book.stockQuantity > 10 
                          ? 'bg-teal-100 text-teal-800' 
                          : book.stockQuantity > 0 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {book.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.publisher || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        
                        <button
                          onClick={() => navigate(`/admin/books/edit/${book.id}`)}
                          className="bg-white text-teal-600 hover:text-teal-800 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="bg-white text-orange-600 hover:text-orange-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BooksManagement;
