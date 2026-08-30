import client from './client';

export const registerRequest = (payload) => client.post('/auth/register', payload);
export const verifyOtpRequest = (payload) => client.post('/auth/verify-otp', payload);
export const resendOtpRequest = (payload) => client.post('/auth/resend-otp', payload);
export const loginRequest = (payload) => client.post('/auth/login', payload);
export const forgotPasswordRequest = (payload) => client.post('/auth/forgot-password', payload);
export const resetPasswordRequest = (payload) => client.post('/auth/reset-password', payload);
export const meRequest = () => client.get('/auth/me');
export const logoutRequest = (refreshToken) => client.post('/auth/logout', { refreshToken });
