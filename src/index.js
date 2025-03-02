import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import { BrowserRouter } from 'react-router-dom';
import { initializeTranslations } from './utils/translations';

initializeTranslations().then(() => {
  const root = createRoot(document.getElementById('root'));
  // Get environment variables or use fallback values for development
  const kindeClientId = process.env.REACT_APP_KINDE_CLIENT_ID || 'your_kinde_client_id';
  const kindeDomain = process.env.REACT_APP_KINDE_DOMAIN || 'your_kinde_domain.kinde.com';
  const kindeRedirectUri = process.env.REACT_APP_KINDE_REDIRECT_URI || window.location.origin + '/kinde_callback';
  const kindeLogoutUri = process.env.REACT_APP_KINDE_LOGOUT_URI || window.location.origin;

  root.render(
    <KindeProvider
      clientId={kindeClientId}
      domain={kindeDomain}
      redirectUri={kindeRedirectUri}
      logoutUri={kindeLogoutUri}
      onRedirectCallback={(user) => {
        // You can handle post-login actions here
        console.log('User authenticated:', user);
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </KindeProvider>
  );
});