import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { discountService, bookService } from '../../services/adminService';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const DiscountsManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bookId: '',
    discountPercentage: '',
    onSaleFlag: false,
    startDate: '',
    endDate: ''
  });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [discountsData, booksData] = await Promise.all([
        discountService.getAllDiscounts(),
        bookService.getAllBooks()
      ]);
      setDiscounts(discountsData);
      setBooks(booksData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;

    try {
      await discountService.deleteDiscount(id);
      setDiscounts(discounts.filter(discount => discount.id !== id));
    } catch (err) {
      console.error('Error deleting discount:', err);
      setError('Failed to delete discount. Please try again.');
    }
  };

  const openModal = (discount = null) => {
    if (discount) {
      // Format dates for form inputs
      const startDate = discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '';
      const endDate = discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '';
      
      setFormData({
        bookId: discount.bookId,
        discountPercentage: discount.discountPercentage,
        onSaleFlag: discount.onSaleFlag,
        startDate,
        endDate
      });
      setEditId(discount.id);
    } else {
      setFormData({
        bookId: '',
        discountPercentage: '',
        onSaleFlag: false,
        startDate: '',
        endDate: ''
      });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      bookId: '',
      discountPercentage: '',
      onSaleFlag: false,
      startDate: '',
      endDate: ''
    });
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const discountData = {
        ...formData,
        bookId: parseInt(formData.bookId, 10),
        discountPercentage: parseFloat(formData.discountPercentage)
      };
      
      if (editId) {
        await discountService.updateDiscount(editId, discountData);
      } else {
        await discountService.createDiscount(discountData);
      }
      
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Error saving discount:', err);
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ') 
        : 'Failed to save discount. Please check your inputs and try again.';
      setError(errorMessage);
    }
  };

  const filteredDiscounts = discounts.filter(discount => {
    const bookTitle = books.find(b => b.id === discount.bookId)?.title || '';
    return bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading && discounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Discounts Management</h2>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-1" /> Add Discount
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
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
            placeholder="Search discounts by book title..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Sale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No discounts found.
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount) => {
                  const book = books.find(b => b.id === discount.bookId);
                  return (
                    <tr key={discount.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{book?.title || 'Unknown Book'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{discount.discountPercentage}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {discount.onSaleFlag ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(discount.startDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {discount.endDate ? new Date(discount.endDate).toLocaleDateString() : 'No End Date'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          discount.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(discount)}
                            className="bg-white text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(discount.id)}
                            className="bg-white text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editId ? 'Edit Discount' : 'Add New Discount'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bookId">
                    Book *
                  </label>
                  <select
                    id="bookId"
                    name="bookId"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.bookId}
                    onChange={handleChange}
                  >
                    <option value="">Select a book</option>
                    {books.map(book => (
                      <option key={book.id} value={book.id}>{book.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountPercentage">
                    Discount Percentage (%) *
                  </label>
                  <input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="onSaleFlag"
                    name="onSaleFlag"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.onSaleFlag}
                    onChange={handleChange}
                  />
                  <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="onSaleFlag">
                    Mark as "On Sale"
                  </label>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                    Start Date *
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave blank for no end date</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsManagement;
