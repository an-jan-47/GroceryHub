import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { history } from './history';
import './index.css';

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <HistoryRouter history={history}>
    <App />
  </HistoryRouter>
);
