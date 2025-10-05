import axios from 'axios';

// Create axios instance with base configuration
// Auto-detect if running on mobile/network access
const getBaseURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  // For network access, use the same hostname but port 8000
  return `http://${window.location.hostname}:8000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60 seconds for comprehensive AI processing
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

// Advanced Analytics API
export const advancedAPI = {
  // Get multi-platform earnings prediction
  async getMultiPlatformEarnings(earnerId, hours = 8, platform = 'both') {
    try {
      const response = await api.get(`/v1/advanced/multi-platform-earnings/${earnerId}`, {
        params: { hours, platform }
      });
      return response.data;
    } catch (error) {
      console.error('Multi-platform earnings error:', error);
      throw new Error('Failed to get multi-platform earnings prediction.');
    }
  },

  // Get location intelligence
  async getLocationIntelligence(cityId, currentTime = null, hexId = null) {
    try {
      const params = {};
      if (currentTime) params.current_time = currentTime;
      if (hexId) params.hex_id = hexId;
      
      const response = await api.get(`/v1/advanced/location-intelligence/${cityId}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Location intelligence error:', error);
      throw new Error('Failed to get location intelligence.');
    }
  },

  // Get comprehensive insights
  async getComprehensiveInsights(earnerId) {
    try {
      const response = await api.get(`/v1/advanced/comprehensive-insights/${earnerId}`);
      return response.data;
    } catch (error) {
      console.error('Comprehensive insights error:', error);
      throw new Error('Failed to get comprehensive insights.');
    }
  },

  // Get city comparison
  async getCityComparison() {
    try {
      const response = await api.get('/v1/advanced/city-comparison');
      return response.data;
    } catch (error) {
      console.error('City comparison error:', error);
      throw new Error('Failed to get city comparison data.');
    }
  },

  // Get enhanced time patterns
  async getTimePatterns() {
    try {
      const response = await api.get('/v1/advanced/time-patterns');
      return response.data;
    } catch (error) {
      console.error('Time patterns error:', error);
      throw new Error('Failed to get time patterns.');
    }
  },

  // Get incentive insights
  async getIncentiveInsights(earnerId) {
    try {
      const response = await api.get(`/v1/advanced/incentive-insights/${earnerId}`);
      return response.data;
    } catch (error) {
      console.error('Incentive insights error:', error);
      throw new Error('Failed to get incentive insights.');
    }
  },

  // Get platform statistics
  async getPlatformStats() {
    try {
      const response = await api.get('/v1/advanced/platform-stats');
      return response.data;
    } catch (error) {
      console.error('Platform stats error:', error);
      throw new Error('Failed to get platform statistics.');
    }
  }
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

// Time-based earnings API
export const timeAPI = {
  // Get real time-based earnings patterns from Excel data
  async getTimePatterns(earnerId) {
    try {
      const response = await api.get(`/time-patterns/${earnerId}`);
      return response.data;
    } catch (error) {
      console.error('Time API Error:', error);
      throw new Error('Failed to fetch time patterns. Please try again.');
    }
  },
};

export default api;
