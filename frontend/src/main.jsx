import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme } from './theme/theme';
import App from './app/App';

import './styles/base.css';
import './styles/ui.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/shop.css';
import './styles/auth.css';
import './styles/booking.css';
import './styles/account.css';
import './styles/admin.css';

// Palette tokens are written to :root before the first paint.
applyTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
