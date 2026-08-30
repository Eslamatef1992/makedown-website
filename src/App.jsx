import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
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
import CartPage from './pages/shop/CartPage';
import CheckoutPage from './pages/shop/CheckoutPage';
import OrderResultPage from './pages/shop/OrderResultPage';
import SchoolsPage from './pages/education/SchoolsPage';
import SchoolDetailPage from './pages/education/SchoolDetailPage';

import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import ChatPage from './pages/profile/ChatPage';
import PackagePurchasePage from './pages/profile/PackagePurchasePage';
import PaymentResultPage from './pages/profile/PaymentResultPage';
import UserProfilePage from './pages/profile/UserProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
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

        {/* Shop / e-commerce */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-placed" element={<OrderResultPage status="success" />} />
        <Route path="/order-failed" element={<OrderResultPage status="failed" />} />

        {/* Packages */}
        <Route path="/packages" element={<PackagesPage />} />

        {/* Game flow — live multiplayer engine not yet built */}
        <Route path="/play" element={<ComingSoon title="Play" />} />
        <Route path="/education" element={<SchoolsPage />} />
        <Route path="/education/:id" element={<SchoolDetailPage />} />

        {/* Profile (protected) + public user profiles */}
        <Route path="/profile/users/:id" element={<UserProfilePage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile/packages/:id/purchase" element={<ProtectedRoute><PackagePurchasePage /></ProtectedRoute>} />
        <Route path="/profile/payment-result" element={<ProtectedRoute><PaymentResultPage /></ProtectedRoute>} />

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
      </CartProvider>
    </AuthProvider>
  );
}
