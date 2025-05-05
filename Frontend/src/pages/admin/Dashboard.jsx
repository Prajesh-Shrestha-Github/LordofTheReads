import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService, discountService, announcementService } from '../../services/adminService';
import { Book, ShoppingCart, Users, BellRing, Percent } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-4', 'bg-opacity-10 text-opacity-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeDiscounts: 0,
    activeAnnouncements: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch book count
        try {
          const books = await bookService.getAllBooks();
          setStats(prevStats => ({
            ...prevStats,
            totalBooks: books.length
          }));
        } catch (err) {
          console.error('Error fetching books:', err);
          console.error('Error response:', err.response?.data);
          setError('Failed to load books. Error: ' + (err.response?.data?.message || err.message));
        }
        
        // Fetch active discounts
        try {
          const discounts = await discountService.getAllDiscounts();
          const activeDiscounts = discounts.filter(d => d.isActive).length;
          setStats(prevStats => ({
            ...prevStats,
            activeDiscounts
          }));
        } catch (err) {
          console.error('Error fetching discounts:', err);
          // Continue - don't let discount failure prevent other data
        }
        
        // Fetch active announcements
        try {
          const announcements = await announcementService.getAllAnnouncements();
          const activeAnnouncements = announcements.filter(a => a.isActive).length;
          setStats(prevStats => ({
            ...prevStats,
            activeAnnouncements
          }));
        } catch (err) {
          console.error('Error fetching announcements:', err);
          // Continue - don't let announcement failure prevent other data
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load dashboard stats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Books" 
          value={stats.totalBooks} 
          icon={<Book className="text-blue-500" size={24} />} 
          color="border-l-4 border-blue-500"
        />
        <StatCard 
          title="Active Discounts" 
          value={stats.activeDiscounts} 
          icon={<Percent className="text-green-500" size={24} />} 
          color="border-l-4 border-green-500"
        />
        <StatCard 
          title="Active Announcements" 
          value={stats.activeAnnouncements} 
          icon={<BellRing className="text-yellow-500" size={24} />} 
          color="border-l-4 border-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link 
              to="/admin/books" 
              className="block w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition"
            >
              Manage Books
            </Link>
            <Link 
              to="/admin/discounts" 
              className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition"
            >
              Manage Discounts
            </Link>
            <Link 
              to="/admin/announcements" 
              className="block w-full text-left px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-md transition"
            >
              Manage Announcements
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">System Info</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex justify-between">
              <span>Application:</span>
              <span className="font-medium">Lord of The Reads</span>
            </li>
            <li className="flex justify-between">
              <span>Environment:</span>
              <span className="font-medium">Development</span>
            </li>
            <li className="flex justify-between">
              <span>API Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </li>
            <li className="flex justify-between">
              <span>Backend URL:</span>
              <span className="font-medium">http://localhost:5253</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
