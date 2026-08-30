import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://agentflow-ai-bet2.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agentflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = error.message || 'An error occurred while connecting to the server';
    if (!error.response && error.code === 'ERR_NETWORK') {
      errorMessage = 'Unable to reach backend API at ' + (process.env.NEXT_PUBLIC_API_URL || 'https://agentflow-ai-bet2.onrender.com/api') + '. Please ensure the backend server is running and accessible.';
    }

    const errorResponse = error.response?.data?.error || {
      code: error.code || 'NETWORK_ERROR',
      message: errorMessage
    };

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // If unauthorized and on a protected page, optionally redirect
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('agentflow_token');
        localStorage.removeItem('agentflow_user');
      }
    }

    return Promise.reject(errorResponse);
  }
);

export default api;
