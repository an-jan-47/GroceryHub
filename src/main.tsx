
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Wait for the device to be ready when using Capacitor
const initialize = async () => {
  // Standard React initialization
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  } else {
    console.error('Root element not found');
  }
};

// Start the app
initialize();
