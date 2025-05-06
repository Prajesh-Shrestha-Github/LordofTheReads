import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * SessionInfo Component
 * 
 * Displays current session information including:
 * - Authentication status
 * - Current user details
 * - User role
 * - Session errors
 * 
 * This component is primarily for debugging and development purposes.
 */
const SessionInfo = ({ showErrors = true }) => {
  const { user, isAuthenticated, hasRole, error: authError, sessionExpired, logout } = useAuth();
  const navigate = useNavigate();
  
  // Convert numeric role to string
  const getRoleName = (roleNum) => {
    switch(roleNum) {
      case 0: return 'Member';
      case 1: return 'Staff';
      case 2: return 'Admin';
      default: return 'Unknown';
    }
  };
  
  // Format time to readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
  };
  
  const handleLogout = () => {
    logout();
    // Navigate to login page
    navigate('/login', { replace: true });
  };
  
  if (!showErrors && !isAuthenticated()) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs z-50 text-sm">
      <h3 className="font-bold text-gray-800 mb-2 flex justify-between items-center">
        Session Info
        {showErrors && (
          <span className={`inline-flex h-2 w-2 rounded-full ${
            isAuthenticated() ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
        )}
      </h3>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium text-gray-700">Status:</span>{' '}
          <span className={isAuthenticated() ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
        
        {isAuthenticated() && (
          <>
            <div>
              <span className="font-medium text-gray-700">User:</span>{' '}
              <span className="text-gray-800">{user?.firstName} {user?.lastName}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Email:</span>{' '}
              <span className="text-gray-800">{user?.email}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Role:</span>{' '}
              <span className={`${
                user?.role === 2 ? 'text-teal-600 font-medium' : 'text-gray-800'
              }`}>
                {user?.role !== undefined ? getRoleName(user.role) : 'N/A'}
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Token Expiry:</span>{' '}
              <span className="text-gray-800">{formatTime(user?.tokenExpiry)}</span>
            </div>
          </>
        )}
        
        {showErrors && authError && (
          <div className="text-orange-600 border-t border-orange-100 pt-2 mt-2">
            <span className="font-medium">Error:</span> {authError}
          </div>
        )}
        
        {showErrors && sessionExpired && (
          <div className="text-orange-600 border-t border-orange-100 pt-2 mt-2">
            Session has expired
          </div>
        )}
        
        {showErrors && !isAuthenticated() && !authError && !sessionExpired && (
          <div className="text-gray-500">
            No active session
          </div>
        )}
        
        <div className="border-t border-gray-100 pt-2 mt-2 text-xs text-gray-500">
          Path: {window.location.pathname}
        </div>

        {isAuthenticated() && (
          <button
            onClick={handleLogout}
            className="mt-2 w-full px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors"
          >
            Clear Session (Debug)
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionInfo;
