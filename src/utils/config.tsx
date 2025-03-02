export const TAROT_IMAGE_BASE_URL: string = 'https://ik.imagekit.io/tarotmancer';

// Define multiple backend URLs to try in case one fails
const BACKEND_URLS = [
  "https://backend-tarotmancer-53d9d741cb25.herokuapp.com",
  "https://backend-tarotmancer.herokuapp.com"
];

// Function to detect deployment environment and set appropriate backend URL
const getBackendUrl = (): string => {
  // Check if we're in local development (localhost)
  const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  // Use primary Heroku app in production
  return BACKEND_URLS[0];
};

// Hardcode the backend URL to ensure it's correctly set
export const API_BASE_URL: string = getBackendUrl();

// Always use /api prefix routes
export const USE_DIRECT_API: boolean = false;

// Image configuration
export const IMAGEKIT_PUBLIC_KEY: string = process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY || '';
export const IMAGEKIT_URL_ENDPOINT: string = 'https://ik.imagekit.io/tarotmancer';