export const TAROT_IMAGE_BASE_URL: string = 'https://ik.imagekit.io/tarotmancer';
// Hardcode the backend URL to ensure it's correctly set
export const API_BASE_URL: string = "https://backend-tarotmancer-53d9d741cb25.herokuapp.com";
// Always use /api prefix routes
export const USE_DIRECT_API: boolean = false;
export const IMAGEKIT_PUBLIC_KEY: string = process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY || '';
export const IMAGEKIT_URL_ENDPOINT: string = 'https://ik.imagekit.io/tarotmancer';