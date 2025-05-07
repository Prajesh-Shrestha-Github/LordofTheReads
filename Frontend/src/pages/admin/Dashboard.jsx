import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService, discountService, announcementService } from '../../services/adminService';
import { Book, ShoppingCart, Users, BellRing, Percent, TrendingUp, Package, Plus, ListFilter } from 'lucide-react';

const StatCard = ({ title, value, icon, color, bgColor, borderColor, trend }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-gray-800">{value}</h3>
          {trend && (
            <p className={`text-xs flex items-center mt-2 ${trend.includes('+') ? 'text-teal-500' : 'text-orange-500'}`}>
              <TrendingUp size={14} className="mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ title, description, icon, color, linkTo }) => {
  return (
    <Link 
      to={linkTo}
      className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-teal-100"
    >
      <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
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
          setError('Failed to load books data');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back, Administrator</h2>
          <p className="text-gray-500 mt-1">Here's what's happening with your bookstore today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex space-x-3">
            <Link 
              to="/admin/books/create" 
              className="inline-flex items-center px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-md hover:bg-teal-600 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add New Book
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Books" 
          value={stats.totalBooks} 
          icon={<Book className="text-teal-500" size={24} />}
          color="text-teal-500"
          bgColor="bg-teal-50"
          borderColor="border-teal-500"
        />
        <StatCard 
          title="Active Discounts" 
          value={stats.activeDiscounts} 
          icon={<Percent className="text-teal-500" size={24} />}
          color="text-teal-500"
          bgColor="bg-teal-50"
          borderColor="border-teal-500"
        />
        <StatCard 
          title="Active Announcements" 
          value={stats.activeAnnouncements} 
          icon={<BellRing className="text-orange-500" size={24} />}
          color="text-orange-500"
          bgColor="bg-orange-50"
          borderColor="border-orange-500"
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ActionCard 
          title="Manage Books" 
          description="Add, edit, or remove books from your inventory" 
          icon={<Book size={24} className="text-white" />}
          color="bg-teal-500"
          linkTo="/admin/books"
        />
        <ActionCard 
          title="Manage Discounts" 
          description="Create and manage promotional discounts" 
          icon={<Percent size={24} className="text-white" />}
          color="bg-teal-500"
          linkTo="/admin/discounts"
        />
        <ActionCard 
          title="Manage Announcements" 
          description="Create and publish announcements for users" 
          icon={<BellRing size={24} className="text-white" />}
          color="bg-orange-500"
          linkTo="/admin/announcements"
        />
      </div>
      
      
    </div>
  );
};

export default Dashboard;
