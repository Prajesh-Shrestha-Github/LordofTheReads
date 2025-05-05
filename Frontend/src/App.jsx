import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Books from "./pages/Books";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BooksManagement from "./pages/admin/BooksManagement";
import BookForm from "./pages/admin/BookForm";
import DiscountsManagement from "./pages/admin/DiscountsManagement";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/books" element={<Books />} />
          
          {/* Admin Panel Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="Admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<BooksManagement />} />
            <Route path="books/create" element={<BookForm />} />
            <Route path="books/edit/:id" element={<BookForm />} />
            <Route path="discounts" element={<DiscountsManagement />} />
            <Route path="announcements" element={<AnnouncementsManagement />} />
          </Route>
          
          {/* Redirect any unknown routes to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;