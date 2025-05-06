import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create auth context
const AuthContext = createContext();

// Provider component that wraps app and makes auth available to any child component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // SessionTimeout in milliseconds (15 minutes for testing)
  const SESSION_TIMEOUT = 15 * 60 * 1000;  
  let sessionTimer = null;

  // Reset session timer
  const resetSessionTimer = () => {
    if (sessionTimer) clearTimeout(sessionTimer);
    
    if (user) {
      sessionTimer = setTimeout(() => {
        console.log('Session timeout reached - logging out automatically');
        setSessionExpired(true);
        logout();
        // We can't use navigate here, so we'll redirect using window.location
        window.location.href = '/login';
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
          // Add token expiry time to user object for display in SessionInfo
          setUser({
            ...currentUser,
            tokenExpiry: new Date(tokenData.exp * 1000)
          });
          resetSessionTimer();
        } else {
          // Token expired
          authService.clearSession();
          setSessionExpired(true);
          setUser(null);
        }
      } else {
        // No user or token found
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
    
    // Re-validate token on window focus to catch session timeouts
    const handleWindowFocus = () => {
      // Validate the token again when the window regains focus
      if (!authService.validateToken()) {
        setUser(null);
        setSessionExpired(true);
      }
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      setSessionExpired(false);
      const response = await authService.login(credentials);
      
      // Get token data to extract expiry
      const token = authService.getToken();
      if (token) {
        const tokenData = authService.parseJwt(token);
        if (tokenData && tokenData.exp) {
          // Add token expiry to user object
          response.tokenExpiry = new Date(tokenData.exp * 1000);
        }
      }
      
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
    authService.clearSession();
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
    resetSessionTimer,
    // Add helper functions for session info display
    getSessionExpiryTime: () => user?.tokenExpiry || null,
    getSessionStatus: () => {
      if (!user) return 'Not authenticated';
      if (sessionExpired) return 'Expired';
      return 'Active';
    },
    clearError: () => setError(null)
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
