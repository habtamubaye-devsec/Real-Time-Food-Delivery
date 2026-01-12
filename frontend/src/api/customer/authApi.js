import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // for HttpOnly cookies
});

// ✅ helper for consistent error messages
const handleError = (err, defaultMsg) =>
  err.response?.data?.message || err.message || defaultMsg || "Something went wrong";

// ------------------- USER AUTH APIS -------------------

// Login
export const loginApi = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return { success: true, data: res.data.data };
  } catch (err) {
    return { success: false, message: handleError(err, "Login failed") };
  }
};

// Logout
export const logoutApi = async () => {
  try {
    await api.post("/auth/logout");
    return { success: true };
  } catch (err) {
    return { success: false, message: handleError(err, "Logout failed") };
  }
};

// Refresh / check auth
export const refreshTokenApi = async () => {
  try {
    const res = await api.post("/auth/refresh-token");
    return { success: true, data: res.data.data };
  } catch (err) {
    return { success: false, message: handleError(err, "Session expired") };
  }
};

// Signup
export const signupApi = async (email, phone, password, role) => {
  try {
    const res = await api.post("/auth/register", {
      email,
      phone,
      password,
      role,
    });
    return { success: true, data: res.data.data };
  } catch (err) {
    return { success: false, message: handleError(err, "Signup failed") };
  }
};
