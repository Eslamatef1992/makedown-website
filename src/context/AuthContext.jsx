import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  verifyOtpRequest,
  resendOtpRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
} from '../api/auth.api';

const AuthContext = createContext(null);

function storeSession({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('md_access_token', accessToken);
  if (refreshToken) localStorage.setItem('md_refresh_token', refreshToken);
}

function clearSession() {
  localStorage.removeItem('md_access_token');
  localStorage.removeItem('md_refresh_token');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('md_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await meRequest();
      setUser(data.data);
    } catch {
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async ({ email, password, rememberMe }) => {
    const { data } = await loginRequest({ email, password, rememberMe });
    storeSession(data.data);
    setUser(data.data.user);
    return data.data;
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    return data.data;
  };

  const verifyOtp = async (payload) => {
    const { data } = await verifyOtpRequest(payload);
    if (data.data?.accessToken) {
      storeSession(data.data);
      setUser(data.data.user);
    }
    return data.data;
  };

  const resendOtp = (payload) => resendOtpRequest(payload).then((r) => r.data.data);
  const forgotPassword = (payload) => forgotPasswordRequest(payload).then((r) => r.data.data);
  const resetPassword = (payload) => resetPasswordRequest(payload).then((r) => r.data.data);

  const logout = async () => {
    const refreshToken = localStorage.getItem('md_refresh_token');
    try {
      await logoutRequest(refreshToken);
    } finally {
      clearSession();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
