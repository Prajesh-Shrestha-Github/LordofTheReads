import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

/**
 * UserOnlyRoute Component
 * Restricts access to user-only routes
 * If the user is an admin, they will be redirected to the admin dashboard
 */
const UserOnlyRoute = ({ children }) => {
  const { isAuthenticated, hasRole, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Force token validation on component mount and path change
    const checkAuth = () => {
      // First check token validity
      const tokenValid = authService.validateToken();
      
      // Check if user is logged in but not an admin
      if (tokenValid && isAuthenticated() && !hasRole('Admin')) {
        setIsValid(true);
      } else if (tokenValid && isAuthenticated() && hasRole('Admin')) {
        // User is admin, not allowed on this route
        setIsValid(false);
      } else if (!tokenValid && isAuthenticated()) {
        // Token is invalid but we think we're authenticated - logout
        logout();
        setIsValid(false);
      } else {
        // Not authenticated at all - allow access as guest
        setIsValid(true);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [isAuthenticated, hasRole, logout, location.pathname]);
  
  if (isLoading) {
    // Return minimal loading indicator while checking auth state
    return <div className="p-4 text-center">Checking authentication...</div>;
  }
  
  // If the user is authenticated and has admin role, redirect to admin dashboard
  if (isAuthenticated() && hasRole('Admin')) {
    console.log('Admin detected on user route, redirecting to admin dashboard');
    return <Navigate to="/admin" replace />;
  }
  
  // If we've determined the route is valid for the current user
  if (isValid) {
    return children;
  }
  
  // Fallback - redirect to login
  return <Navigate to="/login" replace />;
};

export default UserOnlyRoute;
