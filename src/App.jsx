import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Shop / e-commerce — routed, not built yet */}
        <Route path="/products" element={<ComingSoon title="Shop" />} />
        <Route path="/products/:slug" element={<ComingSoon title="Product details" />} />
        <Route path="/cart" element={<ComingSoon title="Cart" />} />
        <Route path="/checkout" element={<ComingSoon title="Checkout" />} />

        {/* Packages */}
        <Route path="/packages" element={<ComingSoon title="Packages" />} />

        {/* Game flow */}
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

        {/* Static pages */}
        <Route path="/privacy-policy" element={<ComingSoon title="Privacy policy" />} />
        <Route path="/terms-and-conditions" element={<ComingSoon title="Terms & conditions" />} />
        <Route path="/return-policy" element={<ComingSoon title="Return policy" />} />
        <Route path="/contact-us" element={<ComingSoon title="Contact us" />} />
        <Route path="/faq" element={<ComingSoon title="FAQ" />} />

        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Routes>
    </AuthProvider>
  );
}
