import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <KindeProvider
      clientId={process.env.REACT_APP_KINDE_CLIENT_ID}
      domain={process.env.REACT_APP_KINDE_DOMAIN}
      redirectUri={process.env.REACT_APP_KINDE_REDIRECT_URI}
      logoutUri={process.env.REACT_APP_KINDE_LOGOUT_URI}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </KindeProvider>
  </React.StrictMode>
);