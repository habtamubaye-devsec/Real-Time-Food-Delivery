// src/api/authApi.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";

const api = axios.create({
  baseURL: `${API_URL}/auth`,
  withCredentials: true, // ✅ send HttpOnly cookies automatically
});

// Send OTP for forgot password
export const sendForgotPasswordOTP = async ({ email, phone }) => {
  const res = await api.post("/forgot-password", { email, phone });
  return res.data;
};

// Reset password with OTP
export const resetPassword = async ({ phone, code, newPassword }) => {
  const res = await api.post("/reset-password", { phone, code, newPassword });
  return res.data;
};

// Verify OTP during signup or login
export const verifyOTP = async ({ phone, otp }) => {
  const res = await api.post("/verify-otp", { phone, otp });
  return res.data;
};
