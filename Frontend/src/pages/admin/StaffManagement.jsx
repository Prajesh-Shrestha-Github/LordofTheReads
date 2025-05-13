import React, { useEffect, useState } from 'react';
import adminStaffService from '../../services/adminStaffService';
import { Plus, Trash2, AlertCircle, RefreshCw, Loader, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminStaffService.getStaff();
      setStaffList(data);
    } catch (err) {
      console.error('Error fetching staff:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load staff';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validate form
    if (!validateForm()) {
      // Form has errors, show toast with the first error
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
    
    try {
      setIsSubmitting(true);
      const newStaff = await adminStaffService.createStaff(formData);
      setStaffList(prev => [...prev, newStaff]);
      
      // Reset form after successful submission
      setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', phoneNumber: '' });
      setFormErrors({});
      
      // Show success notification
      toast.success('Staff member created successfully');
    } catch (err) {
      console.error('Error creating staff:', err);
      
      // Handle API validation errors
      if (err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
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
        }
      } else {
        // Handle general error
        const errorMessage = err.response?.data?.message || 'Failed to create staff member';
        setError(errorMessage);
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await adminStaffService.deleteStaff(id);
      setStaffList(prev => prev.filter(s => s.id !== id));
      toast.success('Staff member deleted successfully');
    } catch (err) {
      console.error('Error deleting staff:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete staff member';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center h-64">
      <Loader className="h-8 w-8 text-teal-600 animate-spin mb-4" />
      <p className="text-gray-600">Loading staff data...</p>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Staff Management</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchStaff();
              }}
              className="mt-2 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-900"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleCreate} className="mb-6 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <input
              name="username"
              placeholder="Username *"
              className={`border rounded px-3 py-2 ${formErrors.username ? 'border-red-500' : ''}`}
              value={formData.username}
              onChange={handleInputChange}
            />
            {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
          </div>
          
          <div className="flex flex-col">
            <input
              name="email"
              type="email"
              placeholder="Email *"
              className={`border rounded px-3 py-2 ${formErrors.email ? 'border-red-500' : ''}`}
              value={formData.email}
              onChange={handleInputChange}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
          
          <div className="flex flex-col">
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password *"
                className={`w-full border rounded px-3 py-2 pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 bg-transparent flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
          </div>
          
          <div className="flex flex-col">
            <input
              name="firstName"
              placeholder="First Name"
              className={`border rounded px-3 py-2 ${formErrors.firstName ? 'border-red-500' : ''}`}
              value={formData.firstName}
              onChange={handleInputChange}
            />
            {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
          </div>
          
          <div className="flex flex-col">
            <input
              name="lastName"
              placeholder="Last Name"
              className={`border rounded px-3 py-2 ${formErrors.lastName ? 'border-red-500' : ''}`}
              value={formData.lastName}
              onChange={handleInputChange}
            />
            {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
          </div>
          
          <div className="flex flex-col">
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              className={`border rounded px-3 py-2 ${formErrors.phoneNumber ? 'border-red-500' : ''}`}
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
            {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">* Required fields</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-4 flex items-center ${isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} text-white px-4 py-2 rounded`}
        >
          {isSubmitting ? (
            <>
              <Loader size={16} className="animate-spin mr-2" /> Creating...
            </>
          ) : (
            <>
              <Plus size={16} className="mr-2" /> Add Staff
            </>
          )}
        </button>
      </form>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No staff found</td>
              </tr>
            ) : (
              staffList.map(staff => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.firstName} {staff.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.phoneNumber || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(staff.registrationDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleDelete(staff.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;
