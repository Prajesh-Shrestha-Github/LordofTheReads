import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

// Create auth context
const AuthContext = createContext();

// Provider component that wraps app and makes auth available to any child component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // SessionTimeout in milliseconds (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;  
  let sessionTimer = null;

  // Reset session timer
  const resetSessionTimer = () => {
    if (sessionTimer) clearTimeout(sessionTimer);
    
    if (user) {
      sessionTimer = setTimeout(() => {
        setSessionExpired(true);
        logout();
      }, SESSION_TIMEOUT);
    }
  };
  
  // Monitor user activity to keep session alive
  useEffect(() => {
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      if (user) resetSessionTimer();
    };
    
    // Add event listeners for activity
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    return () => {
      // Cleanup event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      
      if (sessionTimer) clearTimeout(sessionTimer);
    };
  }, [user]);

  // Check if user is already logged in
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (currentUser && token) {
        // Check token expiry
        const tokenData = authService.parseJwt(token);
        
        if (tokenData && tokenData.exp * 1000 > Date.now()) {
          setUser(currentUser);
          resetSessionTimer();
        } else {
          // Token expired
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      setSessionExpired(false);
      const response = await authService.login(credentials);
      setUser(response);
      resetSessionTimer();
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || err.toString();
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || err.toString();
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = null;
    authService.logout();
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };
  
  // Check if user has a specific role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    // Convert role names to role values if string is provided
    if (typeof requiredRole === 'string') {
      const roleValues = { 'member': 0, 'staff': 1, 'admin': 2 };
      requiredRole = roleValues[requiredRole.toLowerCase()] || 0;
    }
    
    return user.role >= requiredRole;
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    sessionExpired,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    resetSessionTimer
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
