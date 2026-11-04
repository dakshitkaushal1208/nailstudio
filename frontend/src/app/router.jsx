import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../components/layout/SiteLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { RequireAdmin, RequireAuth } from '../components/layout/RouteGuards';
import { Loading } from '../components/ui/States';

const page = (loader) => lazy(loader);

// Customer-facing
const HomePage = page(() => import('../pages/HomePage'));
const GalleryPage = page(() => import('../pages/GalleryPage'));
const ShopPage = page(() => import('../pages/ShopPage'));
const ProductDetailsPage = page(() => import('../pages/ProductDetailsPage'));
const CartPage = page(() => import('../pages/CartPage'));
const CheckoutPage = page(() => import('../pages/CheckoutPage'));
const OrderConfirmationPage = page(() => import('../pages/OrderConfirmationPage'));
const LoginPage = page(() => import('../pages/LoginPage'));
const RegisterPage = page(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = page(() => import('../pages/ForgotPasswordPage'));
const AccountPage = page(() => import('../pages/AccountPage'));
const BookingPage = page(() => import('../pages/BookingPage'));
const MyBookingsPage = page(() => import('../pages/MyBookingsPage'));
const BookingDetailsPage = page(() => import('../pages/BookingDetailsPage'));
const MyOrdersPage = page(() => import('../pages/MyOrdersPage'));
const OrderDetailsPage = page(() => import('../pages/OrderDetailsPage'));
const LegalPage = page(() => import('../pages/LegalPage'));
const NotFoundPage = page(() => import('../pages/NotFoundPage'));

// Owner dashboard
const AdminDashboard = page(() => import('../pages/admin/DashboardPage'));
const AdminAppointments = page(() => import('../pages/admin/AppointmentsPage'));
const AdminProducts = page(() => import('../pages/admin/ProductsPage'));
const AdminProductForm = page(() => import('../pages/admin/ProductFormPage'));
const AdminOrders = page(() => import('../pages/admin/OrdersPage'));
const AdminOrderDetail = page(() => import('../pages/admin/OrderDetailPage'));
const AdminGallery = page(() => import('../pages/admin/GalleryAdminPage'));
const AdminServices = page(() => import('../pages/admin/ServicesAdminPage'));
const AdminAvailability = page(() => import('../pages/admin/AvailabilityPage'));
const AdminSettings = page(() => import('../pages/admin/SettingsPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<Loading block label="Loading" />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop/:slug" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="book" element={<BookingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="privacy" element={<LegalPage kind="privacy" />} />
          <Route path="terms" element={<LegalPage kind="terms" />} />

          <Route element={<RequireAuth />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
            <Route path="my-orders/:id" element={<OrderDetailsPage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="my-bookings/:id" element={<BookingDetailsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<RequireAdmin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="availability" element={<AdminAvailability />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
