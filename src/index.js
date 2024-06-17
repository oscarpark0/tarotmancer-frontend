import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';
import { SpeedInsights } from "@vercel/speed-insights/react"; 
import { Analytics } from '@vercel/analytics/react';

const root = createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
    domain="dev-q868ktvw2za0engx.us.auth0.com"
    clientId="8v7IDgdAgMBKQNggvgg4OKUhp63khWI0"
    authorizationParams={{
      redirect_uri: 'https://tarotmancer-frontend-qflo3w0k7-oscarpark0s-projects.vercel.app/callback', // Update with your frontend URL
      scope: 'openid profile email'
    }}
    useRefreshTokens={true}
    cacheLocation="localstorage"
  >
    <SpeedInsights /> 
    <App />
    <Analytics />
  </Auth0Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
