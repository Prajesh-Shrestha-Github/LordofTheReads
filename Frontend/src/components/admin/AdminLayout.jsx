import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Book, Percent, BellRing, LogOut, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed md:static w-64 h-full transition-all duration-300 ease-in-out bg-indigo-800 text-white shadow-lg ${
        isSidebarOpen ? 'left-0' : '-left-64'
      } md:left-0 z-40`}>
        <div className="px-6 py-4 border-b border-indigo-700">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <p className="text-sm text-indigo-300">Welcome, {user?.firstName || 'Admin'}</p>
        </div>
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${
                  isActive ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700'
                }`}
              >
                <Home size={18} className="mr-2" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/books" 
                className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${
                  isActive ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700'
                }`}
              >
                <Book size={18} className="mr-2" />
                <span>Books</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/discounts" 
                className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${
                  isActive ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700'
                }`}
              >
                <Percent size={18} className="mr-2" />
                <span>Discounts</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/announcements" 
                className={({ isActive }) => `flex items-center px-4 py-2 rounded-md ${
                  isActive ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700'
                }`}
              >
                <BellRing size={18} className="mr-2" />
                <span>Announcements</span>
              </NavLink>
            </li>
          </ul>
          <div className="pt-8 mt-8 border-t border-indigo-700">
            <button 
              onClick={handleLogout} 
              className="flex items-center w-full px-4 py-2 text-indigo-200 hover:bg-indigo-700 rounded-md"
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm py-4 px-6">
          <h1 className="text-2xl font-semibold text-gray-800">LordofTheReads Admin</h1>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
