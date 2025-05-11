import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { List, LogOut, Menu, X } from 'lucide-react';

const StaffLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      navigate('/login');
    }
  }, [isAuthenticated, logout, navigate]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleLogout = () => { logout(); navigate('/login'); };

  const activeSection = location.pathname.startsWith('/staff') ? 'orders' : '';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-teal-500 text-white rounded-md shadow-lg"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed md:static w-72 h-full transition-all duration-300 ease-in-out bg-white border-r border-gray-100 shadow-sm ${
        isSidebarOpen ? 'left-0' : '-left-72'
      } md:left-0 z-40 overflow-y-auto`}>
        <div className="px-6 py-6 border-b border-gray-100 flex items-center space-x-3">
          <List size={24} className="text-teal-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Staff Panel</h2>
            <p className="text-xs text-gray-500">Order Processing</p>
          </div>
        </div>

        <nav className="px-4 py-6">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/staff"
                end
                className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg ${
                  isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                } transition-all duration-200`}
              >
                <List size={18} className="mr-3" />
                <span>Pending Orders</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/staff/processed"
                className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg ${
                  isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                } transition-all duration-200`}
              >
                <List size={18} className="mr-3" />
                <span>Processed Orders</span>
              </NavLink>
            </li>
          </ul>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 bg-white text-gray-700 hover:bg-gray-50 hover:text-orange-500 rounded-lg transition-all duration-200"
            >
              <LogOut size={18} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 py-3 px-6 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {location.pathname === '/staff' && 'Pending Orders'}
            {location.pathname === '/staff/processed' && 'Processed Orders'}
          </h1>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;
