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
  <>
  <KindeProvider

    clientId="fb31f1e47adc4650a66f09248606487b"
    domain="https://tarotmancer.kinde.com"
    redirectUri="https://tarotmancer.com/"
    logoutUri="https://tarotmancer.com"
    isDangerouslyUseLocalStorage={process.env.NODE_ENV === 'development'}
  >
    <SpeedInsights /> 
    <App />
    <Analytics />
  </KindeProvider>
  </>
);


reportWebVitals();
