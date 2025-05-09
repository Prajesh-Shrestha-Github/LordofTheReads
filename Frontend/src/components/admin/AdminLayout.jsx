import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Book, Percent, BellRing, LogOut, Menu, X, User, Settings, Users, BookOpen, ChevronDown, Search } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout, hasRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
    // Reset search query
    setSearchQuery('');
  };

  // Set active section based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') setActiveSection('dashboard');
    else if (path.includes('/admin/books')) setActiveSection('books');
    else if (path.includes('/admin/discounts')) setActiveSection('discounts');
    else if (path.includes('/admin/announcements')) setActiveSection('announcements');
  }, [location.pathname]);

  // Check session expiration every minute
  useEffect(() => {
    const checkSession = () => {
      // Use authentication context to verify session
      if (!isAuthenticated()) {
        logout();
        navigate('/login');
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    checkSession(); // Initial check
    return () => clearInterval(interval);
  }, [isAuthenticated, logout, navigate]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar toggle */}
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
          <BookOpen className="h-6 w-6 text-teal-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Lord of The Reads</h2>
            <p className="text-xs text-gray-500">Administration</p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <User size={18} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</h3>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
        
        <nav className="px-4 py-6">
          <div className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main
          </div>
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg ${
                  isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                } transition-all duration-200`}
              >
                <Home size={18} className="mr-3" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/books" 
                className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg ${
                  isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                } transition-all duration-200`}
              >
                <Book size={18} className="mr-3" />
                <span>Books</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/discounts" 
                className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg ${
                  isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                } transition-all duration-200`}
              >
                <Percent size={18} className="mr-3" />
                <span>Discounts</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/announcements" 
                className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg ${
                  isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                } transition-all duration-200`}
              >
                <BellRing size={18} className="mr-3" />
                <span>Announcements</span>
              </NavLink>
            </li>
          </ul>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </div>
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
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-100 py-3 px-6 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'books' && 'Books Management'}
              {activeSection === 'discounts' && 'Discounts Management'}
              {activeSection === 'announcements' && 'Announcements Management'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            
           
            {/* User dropdown */}
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center bg-white text-White-700 hover:text-teal-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mr-2">
                  <User size={16} className="text-teal-600" />
                </div>
                <span className="hidden md:inline text-sm font-medium">{user?.firstName}</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 bg-white text-sm text-red-500 hover:bg-gray-50 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        <footer className="bg-white border-t border-gray-100 py-4 px-6 text-center text-xs text-gray-500">
          Lord of The Reads Admin Panel {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
