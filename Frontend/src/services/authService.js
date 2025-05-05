import api from './api';

const authService = {
  // Login with email/username and password
  // Parse JWT token to get payload data
  parseJwt: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  },

  // Get token from storage
  getToken: () => {
    return localStorage.getItem('token');
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/Auth/login', {
        usernameOrEmail: credentials.email, // This contains either username or email
        password: credentials.password
      });
      
      // Store the JWT token in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Parse the JWT token to extract role information
        const tokenData = authService.parseJwt(response.data.token);
        const userData = { ...response.data };
        
        // Add role from token claims (the claim with name "role" contains the role as a number)
        if (tokenData && tokenData.role !== undefined) {
          userData.role = parseInt(tokenData.role, 10);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('loginTime', Date.now().toString());
      } else {
        throw new Error('Invalid response from server. No token received.');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid username/email or password');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('An error occurred during login. Please try again later.');
      }
    }
  },
  
  // Register a new user
  register: async (userData) => {
    try {
      // Username should be provided by user
      if (!userData.username) {
        throw new Error('Username is required');
      }
      
      const response = await api.post('/Auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber || null,
        role: 0 // Default to Member role (0)
      });
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.status === 400) {
        // Check for specific error messages about username or email
        if (error.response.data && typeof error.response.data === 'string') {
          if (error.response.data.includes('Username already taken')) {
            throw new Error('Username already taken. Please choose a different username.');
          } else if (error.response.data.includes('Email already registered')) {
            throw new Error('Email already registered. Please use a different email address.');
          }
        }
        
        if (error.response.data.errors) {
          // Handle validation errors
          const validationErrors = Object.values(error.response.data.errors).flat();
          throw new Error(validationErrors[0] || 'Validation failed');
        } else if (error.response.data.message) {
          throw new Error(error.response.data.message);
        } else {
          throw new Error('Invalid registration data');
        }
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('An error occurred during registration. Please try again later.');
      }
    }
  },
  
  // Logout - clear stored tokens
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
  },
  
  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Get current user data
  getCurrentUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
};

export default authService;
