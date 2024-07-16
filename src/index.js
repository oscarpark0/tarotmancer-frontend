import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SpeedInsights } from "@vercel/speed-insights/react"; 
import { Analytics } from '@vercel/analytics/react';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <KindeProvider
      clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
      domain={process.env.REACT_APP_KINDE_DOMAIN}
      redirectUri={process.env.REACT_APP_KINDE_REDIRECT_URI}
      logoutUri={process.env.REACT_APP_KINDE_LOGOUT_URI}
    >
      <SpeedInsights /> 
      <App />
      <Analytics />
    </KindeProvider>
  </React.StrictMode>
);


reportWebVitals();