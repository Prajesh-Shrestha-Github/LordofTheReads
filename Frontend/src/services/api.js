import axios from 'axios';

// Create axios instance with base settings
const api = axios.create({
  baseURL: 'http://localhost:5253/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include authentication token with requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is due to authentication
    if (error.response && error.response.status === 401) {
      // Clear the invalid token
      localStorage.removeItem('token');
      // Optional: redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;