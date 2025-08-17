
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker for PWA functionality
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Check for updates on page load
      registration.update();
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Service Worker update found!');
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New content is available; please refresh.');
            // You could show a notification to the user here
          }
        });
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Wait for the device to be ready when using Capacitor
const initialize = async () => {
  // Register service worker
  await registerServiceWorker();
  
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
