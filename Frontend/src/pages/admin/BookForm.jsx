import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookService, authorGenreService } from '../../services/adminService';
import { Book, Save, ArrowLeft, Plus, X, AlertCircle, CheckCircle, Image } from 'lucide-react';

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
    genreIds: [],
    newAuthors: [],
    newGenres: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newGenreName, setNewGenreName] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch authors and genres
        const [authorsData, genresData] = await Promise.all([
          authorGenreService.getAllAuthors(),
          authorGenreService.getAllGenres()
        ]);
        
        setAuthors(authorsData);
        setGenres(genresData);
        
        // Fetch book details if in edit mode
        if (isEditMode) {
          await fetchBookDetails();
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditMode]);
  
  const fetchBookDetails = async () => {
    try {
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
        genreIds: book.genres?.map(g => g.id) || [],
        newAuthors: [],
        newGenres: []
      });
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Failed to load book details. Please try again.');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAuthorSelection = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(parseInt(options[i].value, 10));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      authorIds: selectedValues
    }));
  };
  
  const handleGenreSelection = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(parseInt(options[i].value, 10));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      genreIds: selectedValues
    }));
  };
  
  const handleAddNewAuthor = () => {
    if (!newAuthorName.trim()) return;
    
    // Check if name already exists in the new authors list
    if (formData.newAuthors.some(a => a.name.toLowerCase() === newAuthorName.trim().toLowerCase())) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      newAuthors: [...prev.newAuthors, { name: newAuthorName.trim() }]
    }));
    
    setNewAuthorName('');
  };
  
  const handleAddNewGenre = () => {
    if (!newGenreName.trim()) return;
    
    // Check if name already exists in the new genres list
    if (formData.newGenres.some(g => g.name.toLowerCase() === newGenreName.trim().toLowerCase())) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      newGenres: [...prev.newGenres, { name: newGenreName.trim() }]
    }));
    
    setNewGenreName('');
  };
  
  const handleRemoveNewAuthor = (index) => {
    setFormData(prev => ({
      ...prev,
      newAuthors: prev.newAuthors.filter((_, i) => i !== index)
    }));
  };
  
  const handleRemoveNewGenre = (index) => {
    setFormData(prev => ({
      ...prev,
      newGenres: prev.newGenres.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare book data
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
        genreIds: Array.isArray(formData.genreIds) ? formData.genreIds : [],
        newAuthors: formData.newAuthors,
        newGenres: formData.newGenres
      };
      
      // Debug: Log the data being sent
      console.log('Sending book data:', JSON.stringify(bookData, null, 2));
      
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
  
  if (loading && isEditMode && !formData.title) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link 
            to="/admin/books" 
            className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Book' : 'Add New Book'}
          </h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate('/admin/books')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {isEditMode ? 'Update Book' : 'Save Book'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-teal-50 border border-teal-200 text-teal-700 p-4 rounded-md mb-6 flex items-start">
          <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>Book {isEditMode ? 'updated' : 'created'} successfully!</p>
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
        {/* Tabs navigation */}
        <div className="border-b border-gray-100">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'basic'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'details'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              Details & Metadata
            </button>
            <button
              onClick={() => setActiveTab('authors')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'authors'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              Authors & Genres
            </button>
          </nav>
        </div>
        
        <form className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter book title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="isbn">
                    ISBN
                  </label>
                  <input
                    id="isbn"
                    name="isbn"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                    value={formData.isbn}
                    onChange={handleChange}
                    placeholder="e.g. 978-3-16-148410-0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter book description"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="w-full pl-7 px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="stockQuantity">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Details & Metadata Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="publicationDate">
                    Publication Date
                  </label>
                  <input
                    id="publicationDate"
                    name="publicationDate"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                    value={formData.publicationDate}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="publisher">
                    Publisher
                  </label>
                  <input
                    id="publisher"
                    name="publisher"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                    value={formData.publisher}
                    onChange={handleChange}
                    placeholder="Publisher name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="imageUrl">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/book-cover.jpg"
                />
                
                <div className="mt-4 flex items-start space-x-4">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <img 
                        src={formData.imageUrl} 
                        alt="Book cover preview" 
                        className="h-40 w-32 object-cover rounded-md border border-gray-200 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/200x300?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-32 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                      <Image size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700">Image Preview</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a valid image URL to see a preview of the book cover.
                      For best results, use images with a 2:3 aspect ratio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Authors & Genres Tab */}
          {activeTab === 'authors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Author selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="authors">
                    Select Existing Authors
                  </label>
                  <select
                    id="authors"
                    multiple
                    className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400 h-32"
                    value={formData.authorIds}
                    onChange={handleAuthorSelection}
                  >
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple</p>
                  
                  {/* Add new author input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newAuthor">
                      Add New Author
                    </label>
                    <div className="flex">
                      <input
                        id="newAuthor"
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-l-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                        placeholder="Author name"
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-teal-500 text-white rounded-r-md hover:bg-teal-600 transition-colors flex items-center"
                        onClick={handleAddNewAuthor}
                      >
                        <Plus size={16} className="mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                  
                  {/* Display new authors to be created */}
                  {formData.newAuthors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">New Authors to Add:</h4>
                      <div className="space-y-2">
                        {formData.newAuthors.map((author, index) => (
                          <div key={index} className="flex items-center bg-teal-50 px-3 py-2 rounded-md">
                            <span className="flex-1 text-sm text-teal-700">{author.name}</span>
                            <button
                              type="button"
                              className="text-teal-500 hover:text-teal-700 p-1"
                              onClick={() => handleRemoveNewAuthor(index)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Genre selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="genres">
                    Select Existing Genres
                  </label>
                  <select
                    id="genres"
                    multiple
                    className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400 h-32"
                    value={formData.genreIds}
                    onChange={handleGenreSelection}
                  >
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple</p>
                  
                  {/* Add new genre input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newGenre">
                      Add New Genre
                    </label>
                    <div className="flex">
                      <input
                        id="newGenre"
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-l-md shadow-sm focus:outline-none focus:ring-teal-400 focus:border-teal-400"
                        placeholder="Genre name"
                        value={newGenreName}
                        onChange={(e) => setNewGenreName(e.target.value)}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-teal-500 text-white rounded-r-md hover:bg-teal-600 transition-colors flex items-center"
                        onClick={handleAddNewGenre}
                      >
                        <Plus size={16} className="mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                  
                  {/* Display new genres to be created */}
                  {formData.newGenres.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">New Genres to Add:</h4>
                      <div className="space-y-2">
                        {formData.newGenres.map((genre, index) => (
                          <div key={index} className="flex items-center bg-teal-50 px-3 py-2 rounded-md">
                            <span className="flex-1 text-sm text-teal-700">{genre.name}</span>
                            <button
                              type="button"
                              className="text-teal-500 hover:text-teal-700 p-1"
                              onClick={() => handleRemoveNewGenre(index)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {isEditMode ? 'Update Book' : 'Save Book'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookForm;
