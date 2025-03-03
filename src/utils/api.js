import axios from 'axios';
import { API_BASE_URL, USE_DIRECT_API } from './config';

// Alternative API URL to try if the primary one fails
const BACKUP_API_URL = "https://backend-tarotmancer.herokuapp.com";

// Log all attempted URLs for debugging
console.log('Using primary API base URL:', API_BASE_URL);
console.log('Backup API URL available:', BACKUP_API_URL);

// Construct the proper API URL based on config
const apiPrefix = USE_DIRECT_API ? '' : '/api';
const baseURL = `${API_BASE_URL}${apiPrefix}`;

// For backup URL
const backupBaseURL = `${BACKUP_API_URL}${apiPrefix}`;

// Set the base URL directly
console.log('Using baseURL for API calls:', baseURL);

// Create an axios instance with default config
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  // Add a timeout for requests
  timeout: 10000
});

// Add response interceptor to handle errors consistently
api.interceptors.response.use(
  response => response,
  error => {
    // Log detailed information about the error
    console.error('API Error:', error.message);
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received from server');
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor to include auth headers when needed
api.interceptors.request.use(
  async (config) => {
    // You could add auth tokens here if needed
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Export common API functions with fallback mock data
export const fetchUserDraws = async (userId, token) => {
  try {
    // Log what we're about to do
    console.log('Fetching user draws using both endpoints if needed');
    
    // Try both endpoints for the request
    const response = await tryBothEndpoints('/user-draws', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined,
        'User-ID': userId,
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('All endpoints failed for fetching user draws:', error.message);
    console.log('Using mock data for user draws as fallback');
    
    // Return mock data as fallback
    return [
      {
        id: 12345,
        spread_type: "three-card",
        created_at: new Date().toISOString(),
        response: "This is a mock tarot reading. The past card shows challenges you've overcome. The present indicates you're in a period of growth. The future suggests new opportunities coming your way."
      }
    ];
  }
};

// Helper function to try both primary and backup endpoints
const tryBothEndpoints = async (endpoint, options) => {
  try {
    // Try the primary endpoint first
    return await api.get(endpoint, options);
  } catch (primaryError) {
    console.log(`Primary endpoint ${baseURL}${endpoint} failed:`, primaryError.message);
    
    // If primary fails with network error, try the backup
    if (primaryError.code === 'ERR_NETWORK') {
      console.log(`Trying backup endpoint: ${backupBaseURL}${endpoint}`);
      try {
        // Create a new axios instance with the backup URL
        const backupApi = axios.create({
          baseURL: backupBaseURL,
          timeout: 8000,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        return await backupApi.get(endpoint, options);
      } catch (backupError) {
        console.log(`Backup endpoint failed too:`, backupError.message);
        throw backupError;
      }
    }
    
    // If it's not a network error, just pass through the original error
    throw primaryError;
  }
};

// Utility function to handle anonymous user draw limits with enhanced security
const checkAnonymousDrawLimit = () => {
  try {
    // Get stored data with fingerprinting for security
    const drawData = localStorage.getItem('anonDrawData');
    
    if (!drawData) {
      return { canDraw: true, nextDrawTime: null, remainingDraws: 1 };
    }
    
    const parsedData = JSON.parse(drawData);
    
    // Get current date/time
    const now = new Date().getTime();
    
    // Check if next draw time has passed
    if (parsedData.nextDrawTime && now < parsedData.nextDrawTime) {
      // Still in restriction period
      const hoursRemaining = Math.floor((parsedData.nextDrawTime - now) / (1000 * 60 * 60));
      const minutesRemaining = Math.floor(((parsedData.nextDrawTime - now) % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        canDraw: false,
        nextDrawTime: parsedData.nextDrawTime,
        timeRemaining: `${hoursRemaining}h ${minutesRemaining}m`,
        remainingDraws: 0
      };
    } else {
      // Restriction period ended
      return { canDraw: true, nextDrawTime: null, remainingDraws: 1 };
    }
  } catch (error) {
    console.error('Error checking anonymous draw limit:', error);
    // Default to allowing a draw if there's an error
    return { canDraw: true, nextDrawTime: null, remainingDraws: 1 };
  }
};

// Function to update anonymous user draw data
const updateAnonymousDrawData = () => {
  try {
    // Set next draw time to 48 hours from now
    const nextDrawTime = new Date().getTime() + (48 * 60 * 60 * 1000);
    
    // Create the draw data object
    const drawData = {
      lastDrawTime: new Date().getTime(),
      nextDrawTime: nextDrawTime,
      // Add a fingerprint of the user's setup
      deviceFingerprint: generateFingerprint()
    };
    
    // Store in localStorage
    localStorage.setItem('anonDrawData', JSON.stringify(drawData));
    
    return { canDraw: false, nextDrawTime, remainingDraws: 0 };
  } catch (error) {
    console.error('Error updating anonymous draw data:', error);
    return { canDraw: true, nextDrawTime: null, remainingDraws: 1 };
  }
};

// Generate a simple fingerprint based on available browser data
const generateFingerprint = () => {
  // Collect various browser properties to create a semi-unique fingerprint
  const screen = window.screen;
  const nav = window.navigator;
  
  // Combine various browser properties
  const fingerprint = [
    nav.userAgent,
    screen.height,
    screen.width,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    nav.language || nav.userLanguage || '',
    nav.platform,
    nav.hardwareConcurrency
  ].join('||');
  
  // Create a hash of the fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(16);
};

export const checkCanDraw = async (userId, token) => {
  try {
    // Check if this is an anonymous user
    const isAnonymousUser = userId && userId.startsWith('anon_');
    
    if (isAnonymousUser) {
      // For anonymous users, use client-side checking with the enhanced security
      const anonymousDrawCheck = checkAnonymousDrawLimit();
      
      // Return in the format expected by the app
      return {
        can_draw: anonymousDrawCheck.canDraw,
        remaining_draws: anonymousDrawCheck.remainingDraws,
        next_draw_time: anonymousDrawCheck.nextDrawTime,
        time_remaining: anonymousDrawCheck.timeRemaining
      };
    }
    
    // For authenticated users, proceed with server-side checking
    
    // First check health endpoint
    try {
      // Log full URL for debugging
      const healthUrl = `${API_BASE_URL}/health`;
      console.log('Attempting health check at:', healthUrl);
      
      const healthResponse = await axios.get(healthUrl, {
        timeout: 5000, // Shorter timeout for health check
      });
      console.log('Health check response:', healthResponse.data);
    } catch (healthError) {
      console.error('Health check failed:', healthError);
      
      // Try backup health endpoint
      try {
        const backupHealthUrl = `${BACKUP_API_URL}/health`;
        console.log('Attempting backup health check at:', backupHealthUrl);
        
        const backupHealthResponse = await axios.get(backupHealthUrl, {
          timeout: 5000,
        });
        console.log('Backup health check response:', backupHealthResponse.data);
      } catch (backupHealthError) {
        console.error('Backup health check also failed');
      }
    }
    
    // Log what we're about to do
    console.log('Checking can-draw using both endpoints if needed');
    
    // Try both endpoints for the main request
    const response = await tryBothEndpoints('/can-draw', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined,
        'User-ID': userId,
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('All endpoints failed for checking draw status:', error.message);
    console.log('Using mock data for draw status as fallback');
    
    // Return mock data allowing draws as fallback
    return {
      can_draw: true,
      remaining_draws: 5
    };
  }
};

// Add a new function to record a draw for anonymous users
export const recordAnonymousDraw = () => {
  return updateAnonymousDrawData();
};

// Tarot card data for client-side fallback
const tarotCards = [
  { name: "The Fool", img: "tarot/major/fool.jpg" },
  { name: "The Magician", img: "tarot/major/magician.jpg" },
  { name: "The High Priestess", img: "tarot/major/highpriestess.jpg" },
  { name: "The Empress", img: "tarot/major/empress.jpg" },
  { name: "The Emperor", img: "tarot/major/emperor.jpg" },
  { name: "The Hierophant", img: "tarot/major/hierophant.jpg" },
  { name: "The Lovers", img: "tarot/major/lovers.jpg" },
  { name: "The Chariot", img: "tarot/major/chariot.jpg" },
  { name: "Strength", img: "tarot/major/strength.jpg" },
  { name: "The Hermit", img: "tarot/major/hermit.jpg" },
  { name: "Wheel of Fortune", img: "tarot/major/wheeloffortune.jpg" },
  { name: "Justice", img: "tarot/major/justice.jpg" },
  { name: "The Hanged Man", img: "tarot/major/hangedman.jpg" },
  { name: "Death", img: "tarot/major/death.jpg" },
  { name: "Temperance", img: "tarot/major/temperance.jpg" },
  { name: "The Devil", img: "tarot/major/devil.jpg" },
  { name: "The Tower", img: "tarot/major/tower.jpg" },
  { name: "The Star", img: "tarot/major/star.jpg" },
  { name: "The Moon", img: "tarot/major/moon.jpg" },
  { name: "The Sun", img: "tarot/major/sun.jpg" },
  { name: "Judgement", img: "tarot/major/judgement.jpg" },
  { name: "The World", img: "tarot/major/world.jpg" },
  // Minor Arcana - Cups
  { name: "Ace of Cups", img: "tarot/cups/cups01.jpg" },
  { name: "Two of Cups", img: "tarot/cups/cups02.jpg" },
  { name: "Three of Cups", img: "tarot/cups/cups03.jpg" },
  { name: "Four of Cups", img: "tarot/cups/cups04.jpg" },
  { name: "Five of Cups", img: "tarot/cups/cups05.jpg" },
  { name: "Six of Cups", img: "tarot/cups/cups06.jpg" },
  { name: "Seven of Cups", img: "tarot/cups/cups07.jpg" },
  { name: "Eight of Cups", img: "tarot/cups/cups08.jpg" },
  { name: "Nine of Cups", img: "tarot/cups/cups09.jpg" },
  { name: "Ten of Cups", img: "tarot/cups/cups10.jpg" },
  { name: "Page of Cups", img: "tarot/cups/cups11.jpg" },
  { name: "Knight of Cups", img: "tarot/cups/cups12.jpg" },
  { name: "Queen of Cups", img: "tarot/cups/cups13.jpg" },
  { name: "King of Cups", img: "tarot/cups/cups14.jpg" },
  // Minor Arcana - Pentacles
  { name: "Ace of Pentacles", img: "tarot/pentacles/pentacles01.jpg" },
  { name: "Two of Pentacles", img: "tarot/pentacles/pentacles02.jpg" },
  { name: "Three of Pentacles", img: "tarot/pentacles/pentacles03.jpg" },
  { name: "Four of Pentacles", img: "tarot/pentacles/pentacles04.jpg" },
  { name: "Five of Pentacles", img: "tarot/pentacles/pentacles05.jpg" },
  { name: "Six of Pentacles", img: "tarot/pentacles/pentacles06.jpg" },
  { name: "Seven of Pentacles", img: "tarot/pentacles/pentacles07.jpg" },
  { name: "Eight of Pentacles", img: "tarot/pentacles/pentacles08.jpg" },
  { name: "Nine of Pentacles", img: "tarot/pentacles/pentacles09.jpg" },
  { name: "Ten of Pentacles", img: "tarot/pentacles/pentacles10.jpg" },
  { name: "Page of Pentacles", img: "tarot/pentacles/pentacles11.jpg" },
  { name: "Knight of Pentacles", img: "tarot/pentacles/pentacles12.jpg" },
  { name: "Queen of Pentacles", img: "tarot/pentacles/pentacles13.jpg" },
  { name: "King of Pentacles", img: "tarot/pentacles/pentacles14.jpg" },
  // Minor Arcana - Wands
  { name: "Ace of Wands", img: "tarot/wands/wands01.jpg" },
  { name: "Two of Wands", img: "tarot/wands/wands02.jpg" },
  { name: "Three of Wands", img: "tarot/wands/wands03.jpg" },
  { name: "Four of Wands", img: "tarot/wands/wands04.jpg" },
  { name: "Five of Wands", img: "tarot/wands/wands05.jpg" },
  { name: "Six of Wands", img: "tarot/wands/wands06.jpg" },
  { name: "Seven of Wands", img: "tarot/wands/wands07.jpg" },
  { name: "Eight of Wands", img: "tarot/wands/wands08.jpg" },
  { name: "Nine of Wands", img: "tarot/wands/wands09.jpg" },
  { name: "Ten of Wands", img: "tarot/wands/wands10.jpg" },
  { name: "Page of Wands", img: "tarot/wands/wands11.jpg" },
  { name: "Knight of Wands", img: "tarot/wands/wands12.jpg" },
  { name: "Queen of Wands", img: "tarot/wands/wands13.jpg" },
  { name: "King of Wands", img: "tarot/wands/wands14.jpg" },
  // Minor Arcana - Swords
  { name: "Ace of Swords", img: "tarot/swords/swords01.jpg" },
  { name: "Two of Swords", img: "tarot/swords/swords02.jpg" },
  { name: "Three of Swords", img: "tarot/swords/swords03.jpg" },
  { name: "Four of Swords", img: "tarot/swords/swords04.jpg" },
  { name: "Five of Swords", img: "tarot/swords/swords05.jpg" },
  { name: "Six of Swords", img: "tarot/swords/swords06.jpg" },
  { name: "Seven of Swords", img: "tarot/swords/swords07.jpg" },
  { name: "Eight of Swords", img: "tarot/swords/swords08.jpg" },
  { name: "Nine of Swords", img: "tarot/swords/swords09.jpg" },
  { name: "Ten of Swords", img: "tarot/swords/swords10.jpg" },
  { name: "Page of Swords", img: "tarot/swords/swords11.jpg" },
  { name: "Knight of Swords", img: "tarot/swords/swords12.jpg" },
  { name: "Queen of Swords", img: "tarot/swords/swords13.jpg" },
  { name: "King of Swords", img: "tarot/swords/swords14.jpg" },
];

// Function to generate a random tarot card
const getRandomCard = () => {
  const randomIndex = Math.floor(Math.random() * tarotCards.length);
  const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
  return { ...tarotCards[randomIndex], orientation };
};

// Simulate a tarot draw for guest users (client-side only)
export const simulateGuestDraw = (spreadType) => {
  // Define position names based on spread type
  let positions = [];
  
  if (spreadType === 'celtic') {
    positions = [
      { position_name: "The Present" },
      { position_name: "The Challenge" },
      { position_name: "The Past" },
      { position_name: "The Future" },
      { position_name: "Above (Conscious)" },
      { position_name: "Below (Unconscious)" },
      { position_name: "Advice" },
      { position_name: "External Influences" },
      { position_name: "Hopes or Fears" },
      { position_name: "Outcome" }
    ];
  } else {
    // Three card spread
    positions = [
      { position_name: "Past" },
      { position_name: "Present" },
      { position_name: "Future" }
    ];
  }
  
  // Generate random cards for each position
  positions = positions.map(pos => {
    const card = getRandomCard();
    // Ensure the image path is properly formatted for guest users
    // Keep the tarot/ prefix to match the format expected by CardReveal
    return {
      ...pos,
      most_common_card: card.name,
      most_common_card_img: card.img, // This already includes the 'tarot/' prefix
      orientation: card.orientation
    };
  });
  
  return { positions };
};

export default api;