import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService } from '../../services/adminService';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    description: '',
    price: '',
    publicationDate: '',
    stockQuantity: '',
    publisher: '',
    imageUrl: '',
    authorIds: [],
    genreIds: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (isEditMode) {
      fetchBookDetails();
    }
  }, [id]);
  
  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const book = await bookService.getBook(id);
      
      // Format the date for the input field (YYYY-MM-DD)
      let formattedDate = '';
      if (book.publicationDate) {
        formattedDate = book.publicationDate.substring(0, 10);
      }
      
      setFormData({
        title: book.title,
        isbn: book.isbn || '',
        description: book.description || '',
        price: book.price,
        publicationDate: formattedDate,
        stockQuantity: book.stockQuantity,
        publisher: book.publisher || '',
        imageUrl: book.imageUrl || '',
        authorIds: book.authors?.map(a => a.id) || [],
        genreIds: book.genres?.map(g => g.id) || []
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Failed to load book details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Format the data for the API
      const bookData = {
        title: formData.title.trim(),
        isbn: formData.isbn?.trim() || null,
        description: formData.description?.trim() || null,
        price: parseFloat(formData.price) || 0,
        publicationDate: formData.publicationDate || null,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        publisher: formData.publisher?.trim() || null,
        imageUrl: formData.imageUrl?.trim() || null,
        authorIds: Array.isArray(formData.authorIds) ? formData.authorIds : [],
        genreIds: Array.isArray(formData.genreIds) ? formData.genreIds : []
      };
      
      // Debug: Log the exact data being sent
      console.log('Submitting book data:', bookData);
      
      if (isEditMode) {
        await bookService.updateBook(id, bookData);
      } else {
        await bookService.createBook(bookData);
      }
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/books');
      }, 1500);
    } catch (err) {
      console.error('Error saving book:', err);
      
      // Show more detailed error information if available
      if (err.response?.data) {
        console.error('Error details:', err.response.data);
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to save book. Please check your inputs and try again.');
        }
      } else {
        setError(err.message || 'An error occurred while saving the book.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Book' : 'Add New Book'}</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
          <p>Book {isEditMode ? 'updated' : 'created'} successfully!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isbn">
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.isbn}
              onChange={handleChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.price}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stockQuantity">
              Stock Quantity *
            </label>
            <input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.stockQuantity}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publicationDate">
              Publication Date
            </label>
            <input
              id="publicationDate"
              name="publicationDate"
              type="date"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.publicationDate}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publisher">
              Publisher
            </label>
            <input
              id="publisher"
              name="publisher"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.publisher}
              onChange={handleChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
              Image URL
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.imageUrl}
              onChange={handleChange}
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <img 
                  src={formData.imageUrl} 
                  alt="Book cover preview" 
                  className="h-32 w-24 object-cover rounded-md border border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x300?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Author and Genre selection would go here - simplified for now */}
          
          <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/books')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
