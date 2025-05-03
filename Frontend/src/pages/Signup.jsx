import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call register function from auth context to connect with backend
      await register(formData);
      
      // Redirect to login page with success message
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! Please sign in.' 
        } 
      });
    } catch (error) {
      setErrors({
        ...errors,
        form: error.toString() || 'An error occurred during registration. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password strength indicators
  const passwordHasMinLength = formData.password.length >= 8;
  const passwordHasLowerCase = /[a-z]/.test(formData.password);
  const passwordHasUpperCase = /[A-Z]/.test(formData.password);
  const passwordHasNumber = /\d/.test(formData.password);
  const passwordHasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-navy mb-2">Create Your Account</h1>
              <p className="text-gray text-sm">Join Lord of the Reads and discover your next literary adventure</p>
            </div>
            
            {errors.form && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {errors.form}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-navy mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.firstName ? 'border-red-500' : 'border-gray'
                    } rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-navy mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.lastName ? 'border-red-500' : 'border-gray'
                    } rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray'
                  } rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-navy mb-1">
                  Phone Number <span className="text-xs text-gray">(Optional)</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold`}
                  placeholder="+977 9XXXXXXXX"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-navy mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-gray'
                    } rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray hover:text-navy"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                
                {/* Password strength indicators */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-navy">Password requirements:</p>
                    <ul className="text-xs space-y-1">
                      <li className="flex items-center">
                        {passwordHasMinLength ? (
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={passwordHasMinLength ? 'text-green-700' : 'text-gray'}>
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center">
                        {passwordHasLowerCase ? (
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={passwordHasLowerCase ? 'text-green-700' : 'text-gray'}>
                          One lowercase letter
                        </span>
                      </li>
                      <li className="flex items-center">
                        {passwordHasUpperCase ? (
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={passwordHasUpperCase ? 'text-green-700' : 'text-gray'}>
                          One uppercase letter
                        </span>
                      </li>
                      <li className="flex items-center">
                        {passwordHasNumber ? (
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={passwordHasNumber ? 'text-green-700' : 'text-gray'}>
                          One number
                        </span>
                      </li>
                      <li className="flex items-center">
                        {passwordHasSpecialChar ? (
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={passwordHasSpecialChar ? 'text-green-700' : 'text-gray'}>
                          One special character
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray'
                  } rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-gold focus:ring-gold border-gray rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray">
                  I agree to the{' '}
                  <Link to="/terms" className="text-gold hover:text-gold-dark">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-gold hover:text-gold-dark">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-navy text-white py-2 px-4 rounded-md hover:bg-gold hover:text-navy transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray">
                Already have an account?{' '}
                <Link to="/login" className="text-gold hover:text-gold-dark font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Signup;