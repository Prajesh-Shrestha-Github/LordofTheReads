import api from './api';

const authService = {
  // Login with email/username and password
  login: async (credentials) => {
    try {
      const response = await api.post('/Auth/login', {
        usernameOrEmail: credentials.email, // This contains either username or email
        password: credentials.password
      });
      
      // Store the JWT token in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'An error occurred during login';
    }
  },
  
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/Auth/register', {
        username: userData.email.split('@')[0], // Generate username from email as a default
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        role: 0 // Default to Member role (0)
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'An error occurred during registration';
    }
  },
  
  // Logout - clear stored tokens
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
