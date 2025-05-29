import axios, { AxiosError, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

// Constants
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'auth_token';

// Create API instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401) {
      // Clear auth data
      Cookies.remove(TOKEN_KEY);
      
      // Redirect to login page
      window.location.href = '/login?session=expired';
    }
    
    // Handle 403 Forbidden - Not enough permissions
    if (status === 403) {
      // Redirect to unauthorized page
      window.location.href = '/sem-permissao';
    }
    
    return Promise.reject(error);
  }
);

// Authentication helpers
export const setAuthToken = (token: string) => {
  // Store token in cookie with httpOnly and secure flags
  Cookies.set(TOKEN_KEY, token, { 
    expires: 1, // 1 day
    secure: window.location.protocol === 'https:',
    sameSite: 'strict'
  });
};

export const getAuthToken = (): string | null => {
  return Cookies.get(TOKEN_KEY) || null;
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export default api;