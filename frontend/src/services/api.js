import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      console.warn('⚠️ Rate limit exceeded, falling back to cached response');
    }
    
    return Promise.reject(error);
  }
);

// Chat API
export const chatAPI = {
  // Send a chat message to the AI assistant
  async sendMessage(message, earnerId = null, conversationHistory = []) {
    try {
      const response = await api.post('/chat', {
        message,
        earner_id: earnerId,
        conversation_history: conversationHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  },
};

// Earnings API
export const earningsAPI = {
  // Get earnings prediction for a driver
  async predictEarnings(earnerId, hours = 8, additionalContext = '') {
    try {
      const response = await api.post('/earnings/predict', {
        earner_id: earnerId,
        hours,
        additional_context: additionalContext,
      });
      return response.data;
    } catch (error) {
      console.error('Earnings API Error:', error);
      throw new Error('Failed to get earnings prediction. Please try again.');
    }
  },
};

// Rest Optimization API
export const restAPI = {
  // Get rest optimization recommendations
  async getRestRecommendations(currentTime = null, earnerId = null) {
    try {
      const params = new URLSearchParams();
      if (currentTime) params.append('current_time', currentTime);
      if (earnerId) params.append('earner_id', earnerId);
      
      const response = await api.get(`/rest/optimize?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Rest API Error:', error);
      throw new Error('Failed to get rest recommendations. Please try again.');
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics
  async getStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Dashboard API Error:', error);
      throw new Error('Failed to load dashboard data. Please try again.');
    }
  },
};

// Health Check API
export const healthAPI = {
  // Check API health
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health Check Error:', error);
      throw new Error('API is not available. Please check your connection.');
    }
  },
};

// Utility functions
export const apiUtils = {
  // Format error messages
  formatError(error) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  },

  // Check if error is network related
  isNetworkError(error) {
    return !error.response && error.request;
  },

  // Check if error is server related
  isServerError(error) {
    return error.response?.status >= 500;
  },

  // Check if error is client related
  isClientError(error) {
    return error.response?.status >= 400 && error.response?.status < 500;
  },
};

export default api;
