import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { BrowserRouter } from 'react-router-dom';

// Wait for the device to be ready when using Capacitor
const initialize = async () => {
  // Standard React initialization
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  } else {
    console.error('Root element not found');
  }
};

// Start the app
initialize();
