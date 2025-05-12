import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, authorGenreService } from '../../services/adminService';
import { Save, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '', isbn: '', description: '', price: '',
    publicationDate: '', stockQuantity: '', publisher: '', imageUrl: '',
    authorIds: [], genreIds: [], newAuthors: [], newGenres: [], language: '', format: '', 
    physicalLibraryAccess: false, isAwardWinning: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [initialLoad, setInitialLoad] = useState(true);

  // Add static dropdown options for language and format
  const languageOptions = ["English", "Spanish", "French", "German", "Chinese", "Japanese"];
  const formatOptions = ["Paperback", "Hardcover", "Signed", "Limited", "First Edition", "Collector’s Edition", "Author’s Edition", "Deluxe Edition"];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [aData, gData] = await Promise.all([
          authorGenreService.getAllAuthors(),
          authorGenreService.getAllGenres()
        ]);
        setAuthors(aData); setGenres(gData);
        if (isEditMode) {
          const book = await bookService.getBook(id);
          setFormData({
            title: book.title || '', isbn: book.isbn || '',
            description: book.description || '', price: book.price || '',
            publicationDate: book.publicationDate?.slice(0,10) || '',
            stockQuantity: book.stockQuantity || '',
            publisher: book.publisher || '', imageUrl: book.imageUrl || '',
            authorIds: book.authors?.map(a => a.id) || [],
            genreIds: book.genres?.map(g => g.id) || [],
            newAuthors: [], newGenres: [], language: book.language || '', format: book.format || '', 
            physicalLibraryAccess: book.physicalLibraryAccess || false, 
            isAwardWinning: book.isAwardWinning || false
          });
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditMode]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.isbn?.trim()) errors.isbn = 'ISBN is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.stockQuantity) errors.stockQuantity = 'Stock quantity is required';
    if (!formData.publisher?.trim()) errors.publisher = 'Publisher is required';
    
    // Format validation
    if (formData.price && isNaN(parseFloat(formData.price))) {
      errors.price = 'Price must be a valid number';
    }
    
    if (formData.stockQuantity && isNaN(parseInt(formData.stockQuantity))) {
      errors.stockQuantity = 'Stock quantity must be a valid number';
    }
    
    // ISBN format validation (basic check)
    if (formData.isbn?.trim() && !/^\d{10}(\d{3})?$/.test(formData.isbn.replace(/-/g, ''))) {
      errors.isbn = 'ISBN must be a valid 10 or 13 digit number';
    }
    
    // Author/Genre validation
    if (formData.authorIds.length === 0 && formData.newAuthors.length === 0) {
      errors.authors = 'At least one author is required';
    }
    
    if (formData.genreIds.length === 0 && formData.newGenres.length === 0) {
      errors.genres = 'At least one genre is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuthorsChange = options => {
    const ids = options.filter(o => typeof o.value === 'number').map(o => o.value);
    const names = options.filter(o => typeof o.value === 'string').map(o => o.value);
    setFormData(prev => ({ ...prev, authorIds: ids, newAuthors: names.map(n=>({ name: n })) }));
  };
  const handleGenresChange = options => {
    const ids = options.filter(o => typeof o.value === 'number').map(o => o.value);
    const names = options.filter(o => typeof o.value === 'string').map(o => o.value);
    setFormData(prev => ({ ...prev, genreIds: ids, newGenres: names.map(n=>({ name: n })) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    // Validate form before submission
    if (!validateForm()) {
      // Show toast with the first validation error
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      // Scroll to the first error field
      const firstErrorField = document.querySelector(`[name="${Object.keys(formErrors)[0]}"]`);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = { ...formData,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        // Ensure publicationDate is null if empty to avoid model binding errors
        publicationDate: formData.publicationDate ? formData.publicationDate : null
      };
      
      if (isEditMode) {
        await bookService.updateBook(id, payload);
        toast.success('Book updated successfully!');
      } else {
        await bookService.createBook(payload);
        toast.success('Book created successfully!');
      }
      
      setSuccess(true);
      // Delay navigation to allow user to see success message
      setTimeout(() => navigate('/admin/books'), 1500);
    } catch (e) {
      console.error('Error saving book:', e);
      console.error('Server response data:', e.response?.data);
      
      // Handle API validation errors
      if (e.response?.data?.errors) {
        const apiErrors = e.response.data.errors;
        const formattedErrors = {};
        
        // Convert API errors to form errors
        Object.keys(apiErrors).forEach(key => {
          const fieldName = key.charAt(0).toLowerCase() + key.slice(1); // Convert to camelCase
          formattedErrors[fieldName] = apiErrors[key][0];
        });
        
        setFormErrors(formattedErrors);
        const firstError = Object.values(formattedErrors)[0];
        if (firstError) {
          toast.error(firstError);
          
          // Scroll to the first error field
          const firstErrorField = document.querySelector(`[name="${Object.keys(formattedErrors)[0]}"]`);
          if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
          }
        }
      } else {
        // Handle general error
        let msg = 'Failed to save book';
        const data = e.response?.data;
        
        if (data) {
          if (typeof data === 'object' && !data.errors) {
            // data is ModelState dictionary
            const errors = Object.values(data).flat();
            if (errors.length) msg = errors.join(', ');
          } else if (typeof data === 'string') {
            msg = data;
          } else if (data.message) {
            msg = data.message;
          }
        }
        
        setError(msg);
        toast.error(msg);
      }
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading && isEditMode && !formData.title) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <Loader className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading book details...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit' : 'Add'} Book</h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError('')} 
            className="ml-auto text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
          <p className="text-green-700">Book saved successfully! Redirecting to books list...</p>
        </div>
      )}
      <div className="mb-8">
        <div className="flex justify-center gap-4 mb-2">
          <button
            onClick={()=>setActiveTab('basic')}
            className={`py-3 px-8 rounded-md font-medium transition-all shadow-sm ${
              activeTab==='basic'
                ? 'bg-teal-500 text-white transform translate-y-0'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-500'
            }`}
          >
            Basic
          </button>
          <button
            onClick={()=>setActiveTab('details')}
            className={`py-3 px-8 rounded-md font-medium transition-all shadow-sm ${
              activeTab==='details'
                ? 'bg-teal-500 text-white transform translate-y-0'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-500'
            }`}
          >
            Details
          </button>
          <button
            onClick={()=>setActiveTab('authors')}
            className={`py-3 px-8 rounded-md font-medium transition-all shadow-sm ${
              activeTab==='authors'
                ? 'bg-teal-500 text-white transform translate-y-0'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-500'
            }`}
          >
            Authors/Genres
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab==='basic' && (
          <>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded-md ${formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">ISBN <span className="text-red-500">*</span></label>
              <input 
                name="isbn" 
                value={formData.isbn} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded-md ${formErrors.isbn ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {formErrors.isbn && <p className="text-red-500 text-xs mt-1">{formErrors.isbn}</p>}
              <p className="text-xs text-gray-500 mt-1">Format: 10 or 13 digits (e.g., 9781234567890)</p>
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full p-2 border rounded-md border-gray-300 h-32"
              ></textarea>
            </div>
          </>
        )}
        {activeTab==='details' && (
          <>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
              <input 
                name="price" 
                type="number" 
                step="0.01" 
                value={formData.price} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded-md ${formErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
              <input 
                name="stockQuantity" 
                type="number" 
                value={formData.stockQuantity} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded-md ${formErrors.stockQuantity ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {formErrors.stockQuantity && <p className="text-red-500 text-xs mt-1">{formErrors.stockQuantity}</p>}
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Publisher <span className="text-red-500">*</span></label>
              <input 
                name="publisher" 
                value={formData.publisher} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded-md ${formErrors.publisher ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {formErrors.publisher && <p className="text-red-500 text-xs mt-1">{formErrors.publisher}</p>}
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Publication Date</label>
              <input 
                name="publicationDate" 
                type="date" 
                value={formData.publicationDate} 
                onChange={handleChange} 
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Language</label>
              <CreatableSelect
                isClearable
                name="language"
                onChange={opt => setFormData(prev => ({ ...prev, language: opt?.value || '' }))}
                options={languageOptions.map(lang => ({ value: lang, label: lang }))}
                value={formData.language ? { value: formData.language, label: formData.language } : null}
              />
            </div>
            <div><label>Format</label>
              <CreatableSelect
                isMulti
                name="format"
                onChange={opts => setFormData(prev => ({ ...prev, format: opts.map(o => o.value).join(',') }))}
                options={formatOptions.map(fmt => ({ value: fmt, label: fmt }))}
                value={formData.format.split(',').filter(f=>f).map(f => ({ value: f, label: f }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="mr-2">Physical Library Access</label>
              <input
                type="checkbox"
                name="physicalLibraryAccess"
                checked={formData.physicalLibraryAccess}
                onChange={e => setFormData(prev => ({ ...prev, physicalLibraryAccess: e.target.checked }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="mr-2">Award Winning Book</label>
              <input
                type="checkbox"
                name="isAwardWinning"
                checked={formData.isAwardWinning}
                onChange={e => setFormData(prev => ({ ...prev, isAwardWinning: e.target.checked }))}
              />
              <span className="text-xs text-gray-500 ml-2">(Will display an award badge on the book)</span>
            </div>
            <div><label>Image URL</label><input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 border"/></div>
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Cover preview"
                className="w-24 h-32 object-cover mt-2"
                onError={e => { e.target.src = `https://placehold.co/100x150?text=No+Cover`; }}
              />
            )}
          </>
        )}
        {activeTab==='authors' && (
          <>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Authors <span className="text-red-500">*</span></label>
              <CreatableSelect
                isMulti
                options={authors
                  .filter(a => !formData.authorIds.includes(a.id))
                  .map(a => ({ value: a.id, label: a.name }))}
                value={[
                  ...formData.authorIds.map(id => ({
                    value: id,
                    label: authors.find(a => a.id === id)?.name || ''
                  })),
                  ...formData.newAuthors.map(a => ({ value: a.name, label: a.name }))
                ]}
                onChange={handleAuthorsChange}
                placeholder="Select or add authors..."
                closeMenuOnSelect={false}
                isClearable={true}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    borderColor: formErrors.authors ? '#f56565' : base.borderColor,
                    backgroundColor: formErrors.authors ? '#FEF2F2' : base.backgroundColor
                  })
                }}
              />
              {formErrors.authors && <p className="text-red-500 text-xs mt-1">{formErrors.authors}</p>}
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Genres <span className="text-red-500">*</span></label>
              <CreatableSelect
                isMulti
                options={genres
                  .filter(g => !formData.genreIds.includes(g.id))
                  .map(g => ({ value: g.id, label: g.name }))}
                value={[
                  ...formData.genreIds.map(id => ({
                    value: id,
                    label: genres.find(g => g.id === id)?.name || ''
                  })),
                  ...formData.newGenres.map(g => ({ value: g.name, label: g.name }))
                ]}
                onChange={handleGenresChange}
                placeholder="Select or add genres..."
                closeMenuOnSelect={false}
                isClearable={true}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    borderColor: formErrors.genres ? '#f56565' : base.borderColor,
                    backgroundColor: formErrors.genres ? '#FEF2F2' : base.backgroundColor
                  })
                }}
              />
              {formErrors.genres && <p className="text-red-500 text-xs mt-1">{formErrors.genres}</p>}
            </div>
          </>
        )}
        <button 
          type="submit" 
          disabled={submitting}
          className={`px-4 py-2 ${submitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'} text-white rounded-md transition-colors flex items-center justify-center min-w-[100px]`}
        >
          {submitting ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BookForm;
