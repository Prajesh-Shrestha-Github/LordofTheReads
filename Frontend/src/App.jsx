import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import MyReviews from "./pages/MyReviews";
import Signup from "./pages/Signup";
import Books from "./pages/Books";
import Bookmarks from "./pages/Bookmarks";
import BookDetails from "./pages/BookDetails";
import About from "./pages/About";
import Notifications from "./pages/Notifications";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserOnlyRoute from "./components/UserOnlyRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BooksManagement from "./pages/admin/BooksManagement";
import BookForm from "./pages/admin/BookForm";
import DiscountsManagement from "./pages/admin/DiscountsManagement";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import authService from "./services/authService";
import StaffLayout from "./components/staff/StaffLayout";
import PendingOrders from "./pages/staff/PendingOrders";
import ProcessedOrders from "./pages/staff/ProcessedOrders";

// Root level redirection component to handle admin routes
const RootRedirect = () => {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (isAuthenticated() && hasRole('Admin')) {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/" replace />;
};

// Check if user is an admin and redirect if needed
const AdminRedirectWrapper = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (isAuthenticated() && hasRole('Admin')) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

// Wrapper for the entire app to ensure admin users are redirected properly
const AppRoutes = () => {
  const { isAuthenticated, hasRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // This useEffect will run on every route change and will check admin status
  useEffect(() => {
    const checkAdminStatus = () => {
      // First validate the token is still valid
      const isValid = authService.validateToken();
      
      if (!isValid && isAuthenticated()) {
        console.log('Session expired or invalid - redirecting to login');
        logout();
        navigate('/login', { replace: true, state: { message: 'Your session has expired. Please log in again.' } });
        return;
      }
      
      // Check if the user is an admin trying to access a non-admin route
      if (isAuthenticated() && hasRole('Admin')) {
        const path = location.pathname;
        
        // If the admin is not on an admin route, redirect them to admin dashboard
        if (!path.startsWith('/admin')) {
          console.log('Admin trying to access non-admin route:', path);
          console.log('Redirecting to admin dashboard');
          navigate('/admin', { replace: true });
        }
      }
    };
    
    // Run the check immediately
    checkAdminStatus();
  }, [location.pathname, isAuthenticated, hasRole, logout, navigate]);
  
  // Add event listener to revalidate on window focus
  useEffect(() => {
    const handleFocus = () => {
      // Validate that the token is still valid when window gets focus
      const isValid = authService.validateToken();
      
      if (!isValid && isAuthenticated()) {
        console.log('Session expired on window focus - redirecting to login');
        logout();
        navigate('/login', { replace: true, state: { message: 'Your session has expired. Please log in again.' } });
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, logout, navigate]);
  
  return (
    <Routes>
      {/* User Routes with Admin Restriction */}
      <Route path="/" element={
        <AdminRedirectWrapper>
          <Home />
        </AdminRedirectWrapper>
      } />
      <Route path="/about" element={
        <AdminRedirectWrapper>
          <About />
        </AdminRedirectWrapper>
      } />
      <Route path="/cart" element={
        <UserOnlyRoute>
          <Cart />
        </UserOnlyRoute>
      } />
      <Route path="/books" element={
        <UserOnlyRoute>
          <Books />
        </UserOnlyRoute>
      } />
      <Route path="/categories/*" element={
        <UserOnlyRoute>
          <Books />
        </UserOnlyRoute>
      } />
      <Route path="/bookmarks" element={
        <UserOnlyRoute>
          <Bookmarks />
        </UserOnlyRoute>
      } />
      <Route path="/book/:id" element={
        <UserOnlyRoute>
          <BookDetails />
        </UserOnlyRoute>
      } />
      <Route path="/notifications" element={
        <UserOnlyRoute>
          <Notifications />
        </UserOnlyRoute>
      } />
      <Route path="/checkout" element={
        <UserOnlyRoute>
          <Checkout />
        </UserOnlyRoute>
      } />
      <Route path="/order-confirmation/:orderId" element={
        <UserOnlyRoute>
          <OrderConfirmation />
        </UserOnlyRoute>
      } />
      <Route path="/orders" element={
        <UserOnlyRoute>
          <Orders />
        </UserOnlyRoute>
      } />
      <Route path="/reviews" element={
        <UserOnlyRoute>
          <MyReviews />
        </UserOnlyRoute>
      } />
      
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Admin Panel Routes */}
      <Route 
        path="/admin" 
        element={<ProtectedRoute requiredRole="Admin" redirectPath="/login" />}
      >
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<BooksManagement />} />
          <Route path="books/create" element={<BookForm />} />
          <Route path="books/edit/:id" element={<BookForm />} />
          <Route path="discounts" element={<DiscountsManagement />} />
          <Route path="announcements" element={<AnnouncementsManagement />} />
          <Route path="staff" element={<StaffManagement />} />
        </Route>
      </Route>

      {/* Staff Panel Routes */}
      <Route 
        path="/staff" 
        element={<ProtectedRoute requiredRole="Staff" redirectPath="/login" />}
      >
        <Route element={<StaffLayout />}
        >
          <Route index element={<PendingOrders />} />
          <Route path="processed" element={<ProcessedOrders />} />
        </Route>
      </Route>

      {/* Redirect any unknown routes to appropriate page based on role */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </Router>
    </AuthProvider>
  );
}

export default App;