export const TAROT_IMAGE_BASE_URL: string = 'https://ik.imagekit.io/tarotmancer';
// Try the main tarotmancer backend URL instead
export const API_BASE_URL: string = process.env.REACT_APP_BASE_URL || "https://tarotmancer-backend.herokuapp.com";
export const IMAGEKIT_PUBLIC_KEY: string = process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY || '';
export const IMAGEKIT_URL_ENDPOINT: string = 'https://ik.imagekit.io/tarotmancer';