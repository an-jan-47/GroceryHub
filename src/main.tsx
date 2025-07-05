import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { history } from './history';
import './index.css';

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';

// Make React available globally
window.React = React;

// Ensure React is fully initialized before rendering
window.whenReactIsReady(() => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <HistoryRouter history={history}>
        <App />
      </HistoryRouter>
    );
  } else {
    console.error('Root element not found');
  }
});
