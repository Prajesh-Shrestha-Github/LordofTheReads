import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, error: authError, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect messages
  useEffect(() => {
    // Get success message from location state if it exists
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear location state after 5 seconds
      setTimeout(() => {
        window.history.replaceState({}, document.title);
        setSuccessMessage('');
      }, 5000);
    }

    // Set session expired message if applicable, but only if the user was previously logged in
    if (sessionExpired && localStorage.getItem('wasLoggedIn') === 'true') {
      setGlobalError('Your session has expired. Please log in again.');
    }
  }, [location, sessionExpired]);

  // Set global error when auth error changes
  useEffect(() => {
    if (authError) {
      setGlobalError(authError);
    }
  }, [authError]);

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

    if (!formData.usernameOrEmail) {
      newErrors.usernameOrEmail = 'Username or Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
    setGlobalError('');

    try {
      // Call login from auth context which connects to the backend
      const userData = await login({
        email: formData.usernameOrEmail, // The API will handle it as usernameOrEmail
        password: formData.password
      });

      if (userData && userData.role === 2) {
        navigate('/admin');
      } else if (userData && userData.role === 1) {
        navigate('/staff');
      } else {
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo);
      }
    } catch (error) {
      setGlobalError(error.message || 'Invalid login credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-navy mb-2">Welcome Back</h1>
              <p className="text-gray text-sm">Sign in to continue to Lord of the Reads</p>
            </div>

            {successMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
                {successMessage}
              </div>
            )}

            {globalError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{globalError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-navy mb-1">
                  Username or Email
                </label>
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  autoComplete="username email"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.usernameOrEmail ? 'border-red-500' : 'border-gray'
                  } rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold`}
                  placeholder="Username or email address"
                  disabled={isLoading}
                />
                {errors.usernameOrEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.usernameOrEmail}</p>
                )}
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
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 pr-10 border ${
                      errors.password ? 'border-red-500' : 'border-gray'
                    } rounded-md text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold`}
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 bg-transparent flex items-center justify-center text-gray hover:text-navy"
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
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-gold text-white font-medium rounded-md focus:outline-none hover:bg-amber-500 transition-colors duration-200 flex justify-center items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-gold hover:text-gold-dark font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>

            
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Login;