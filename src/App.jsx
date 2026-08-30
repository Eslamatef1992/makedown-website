import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AccountVerification from './pages/auth/AccountVerification';
import ChangeEmail from './pages/auth/ChangeEmail';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import ProductsPage from './pages/shop/ProductsPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import PackagesPage from './pages/PackagesPage';
import StaticPage from './pages/StaticPage';
import FaqPage from './pages/FaqPage';
import ContactUsPage from './pages/ContactUsPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account-verification" element={<AccountVerification />} />
        <Route path="/change-email" element={<ChangeEmail />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Shop / e-commerce — browsing is live, cart/checkout not yet */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<ComingSoon title="Cart" />} />
        <Route path="/checkout" element={<ComingSoon title="Checkout" />} />

        {/* Packages */}
        <Route path="/packages" element={<PackagesPage />} />

        {/* Game flow — live multiplayer engine not yet built */}
        <Route path="/play" element={<ComingSoon title="Play" />} />
        <Route path="/education" element={<ComingSoon title="School games" />} />

        {/* Profile (protected) */}
        <Route
          path="/profile/*"
          element={
            <ProtectedRoute>
              <ComingSoon title="My profile" />
            </ProtectedRoute>
          }
        />

        {/* CMS-backed static pages */}
        <Route path="/about-us" element={<StaticPage slug="about-us" title="About us" />} />
        <Route path="/privacy-policy" element={<StaticPage slug="privacy-policy" title="Privacy policy" />} />
        <Route path="/terms-and-conditions" element={<StaticPage slug="terms-and-conditions" title="Terms & conditions" />} />
        <Route path="/return-policy" element={<StaticPage slug="return-policy" title="Return policy" />} />
        <Route path="/how-it-works" element={<StaticPage slug="how-it-works" title="How it works" />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />

        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Routes>
    </AuthProvider>
  );
}
