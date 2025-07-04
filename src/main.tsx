import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { history } from './history';
import './index.css';
// Remove this line completely:
// import '../public/fix-forwardref.js';

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';

// Ensure React is fully initialized before rendering
document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById('root')!).render(
    <HistoryRouter history={history}>
      <App />
    </HistoryRouter>
  );
});
