import { BrowserRouter } from 'react-router-dom';
import { StudioProvider } from '../context/StudioContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { CartProvider } from '../context/CartContext';
import { AppRoutes } from './router';

export default function App() {
  return (
    <BrowserRouter>
      <StudioProvider>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </StudioProvider>
    </BrowserRouter>
  );
}
