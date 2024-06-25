import { Auth0Client } from '@auth0/auth0-spa-js';

const auth0 = new Auth0Client({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
  redirect_uri: window.location.origin,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
});

export default auth0;