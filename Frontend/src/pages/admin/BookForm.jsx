import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, authorGenreService } from '../../services/adminService';
import { Save, CheckCircle } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '', isbn: '', description: '', price: '',
    publicationDate: '', stockQuantity: '', publisher: '', imageUrl: '',
    authorIds: [], genreIds: [], newAuthors: [], newGenres: [], language: '', format: '', physicalLibraryAccess: false
  });
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

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
            newAuthors: [], newGenres: [], language: book.language || '', format: book.format || '', physicalLibraryAccess: book.physicalLibraryAccess
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

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
    setLoading(true); setError('');
    try {
      const payload = { ...formData,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity,10) || 0
      };
      if (isEditMode) await bookService.updateBook(id, payload);
      else await bookService.createBook(payload);
      setSuccess(true);
      setTimeout(() => navigate('/admin/books'), 1200);
    } catch (e) {
      console.error('Error saving book:', e);
      // Log full server response
      console.error('Server response data:', e.response?.data);
      // Flatten ModelState errors or use message
      let msg = 'Failed to save book';
      const data = e.response?.data;
      if (data) {
        if (typeof data === 'object') {
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
    } finally { setLoading(false); }
  };

  if (loading && isEditMode && !formData.title) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit' : 'Add'} Book</h2>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">Success!</div>}
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
            <div><label>Title</label><input required name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border"/></div>
            <div><label>ISBN</label><input name="isbn" value={formData.isbn} onChange={handleChange} className="w-full p-2 border"/></div>
            <div><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border"/></div>
          </>
        )}
        {activeTab==='details' && (
          <>
            <div><label>Price</label><input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border"/></div>
            <div><label>Stock Quantity</label><input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="w-full p-2 border"/></div>
            <div><label>Publication Date</label><input type="date" name="publicationDate" value={formData.publicationDate} onChange={handleChange} className="w-full p-2 border"/></div>
            <div><label>Publisher</label><input name="publisher" value={formData.publisher} onChange={handleChange} className="w-full p-2 border"/></div>
            <div><label>Language</label><select name="language" value={formData.language} onChange={handleChange} className="w-full p-2 border">
              <option value="">Select language</option>
              {languageOptions.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select></div>
            <div><label>Format</label><select name="format" value={formData.format} onChange={handleChange} className="w-full p-2 border">
              <option value="">Select format</option>
              {formatOptions.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
            </select></div>
            <div className="flex items-center gap-2">
              <label className="mr-2">Physical Library Access</label>
              <input
                type="checkbox"
                name="physicalLibraryAccess"
                checked={formData.physicalLibraryAccess}
                onChange={e => setFormData(prev => ({ ...prev, physicalLibraryAccess: e.target.checked }))}
              />
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
            <div>
              <label>Authors & New</label>
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
                  menuPortal: base => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>
            <div>
              <label>Genres & New</label>
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
                  menuPortal: base => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>
          </>
        )}
        <button 
          type="submit" 
          disabled={loading} 
          className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center"
        >
          {loading ? 'Saving...' : (
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
