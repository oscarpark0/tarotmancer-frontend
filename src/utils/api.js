import axios from 'axios';
import { API_BASE_URL } from './config';

// Create an axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor to include auth headers when needed
api.interceptors.request.use(
  async (config) => {
    // You could add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export common API functions
export const fetchUserDraws = async (userId, token) => {
  try {
    const response = await api.get('/user-draws', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-ID': userId,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user draws:', error);
    throw error;
  }
};

export const checkCanDraw = async (userId, token) => {
  try {
    // Also check health endpoint
    try {
      const healthResponse = await api.get('/health');
      console.log('Health check response:', healthResponse.data);
    } catch (healthError) {
      console.error('Health check failed:', healthError);
    }
    
    const response = await api.get('/can-draw', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-ID': userId,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking draw status:', error);
    throw error;
  }
};

export default api;