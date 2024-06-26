import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SpeedInsights } from "@vercel/speed-insights/react"; 
import { Analytics } from '@vercel/analytics/react';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SpeedInsights /> 
    <App />
    <Analytics />
  </React.StrictMode>
);


reportWebVitals();
