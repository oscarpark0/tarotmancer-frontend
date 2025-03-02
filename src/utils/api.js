import axios from 'axios';
import { API_BASE_URL } from './config';

// Log all attempted URLs for debugging
console.log('Using API base URL:', API_BASE_URL);

// Create a function to attempt various backend URL patterns
const detectBackendUrl = async () => {
  // Try different URL patterns
  const possibleUrls = [
    `${API_BASE_URL}/api`,
    `${API_BASE_URL}`,
    'https://backend-tarotmancer-53d9d741cb25.herokuapp.com/api',
    'https://backend-tarotmancer-53d9d741cb25.herokuapp.com',
    'https://backend-tarotmancer.herokuapp.com/api',
    'https://backend-tarotmancer.herokuapp.com'
  ];
  
  console.log('Attempting to detect backend URL from candidates:', possibleUrls);
  
  for (const url of possibleUrls) {
    try {
      console.log(`Testing URL: ${url}/ping`);
      const response = await axios.get(`${url}/ping`, { timeout: 3000 });
      if (response.status === 200) {
        console.log(`Backend detected at: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`URL ${url} failed:`, error.message);
    }
  }
  
  console.log('Could not detect backend URL, using default');
  return `${API_BASE_URL}/api`;
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // This will be updated dynamically if needed
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Try to detect backend URL and update the API instance
detectBackendUrl().then(baseUrl => {
  console.log('Setting API baseURL to:', baseUrl);
  api.defaults.baseURL = baseUrl;
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