import React, { useEffect, useState } from 'react';
import adminStaffService from '../../services/adminStaffService';
import { Plus, Trash2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await adminStaffService.getStaff();
      setStaffList(data);
    } catch (err) {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newStaff = await adminStaffService.createStaff(formData);
      setStaffList(prev => [...prev, newStaff]);
      setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', phoneNumber: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminStaffService.deleteStaff(id);
      setStaffList(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Failed to delete staff');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Staff Management</h2>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      <form onSubmit={handleCreate} className="mb-6 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="username"
            placeholder="Username"
            className="border rounded px-3 py-2"
            value={formData.username}
            onChange={handleInputChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2"
            value={formData.email}
            onChange={handleInputChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border rounded px-3 py-2"
            value={formData.password}
            onChange={handleInputChange}
          />
          <input
            name="firstName"
            placeholder="First Name"
            className="border rounded px-3 py-2"
            value={formData.firstName}
            onChange={handleInputChange}
          />
          <input
            name="lastName"
            placeholder="Last Name"
            className="border rounded px-3 py-2"
            value={formData.lastName}
            onChange={handleInputChange}
          />
          <input
            name="phoneNumber"
            placeholder="Phone Number"
            className="border rounded px-3 py-2"
            value={formData.phoneNumber}
            onChange={handleInputChange}
          />
        </div>
        <button
          type="submit"
          className="mt-4 flex items-center bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          <Plus size={16} className="mr-2" /> Add Staff
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
