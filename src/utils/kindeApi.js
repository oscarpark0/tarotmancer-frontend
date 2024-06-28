import axios from 'axios';

const getKindeAccessToken = async () => {
  const domain = process.env.REACT_APP_KINDE_DOMAIN;
  const clientId = process.env.REACT_APP_KINDE_API_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_KINDE_API_KEY;

  try {
    const response = await axios.post(
      `${domain}/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: `${domain}/api`,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Kinde access token:', error);
    throw error;
  }
};

export { getKindeAccessToken };