import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

const getKindeAccessToken = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/kinde-token`);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Kinde access token:', error);
    throw error;
  }
};

const testKindeConnection = async () => {
  try {
    const accessToken = await getKindeAccessToken();
    // Use the access token to make a request to your backend
    const response = await axios.get(`${API_BASE_URL}/api/test-kinde-connection`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('Kinde API connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('Error testing Kinde API connection:', error);
    return false;
  }
};

export { getKindeAccessToken, testKindeConnection };
