import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole, redirectPath = '/login' }) => {
  const { isAuthenticated, hasRole } = useAuth();
  
  // Check if user is authenticated and has the required role
  if (!isAuthenticated()) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If a specific role is required, check if user has that role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }
  
  // Render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
