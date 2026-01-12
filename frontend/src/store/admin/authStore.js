import { create } from "zustand";
import axios from "axios";

// Axios instance with cookies enabled
const api = axios.create({
  baseURL: "https://real-time-food-delivery.onrender.com/api/delivery",
  withCredentials: true, // important for HttpOnly cookies
});

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,
  loading: true, // track auth check loading
  pendingUser: null,

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      set({ isLoggedIn: true, user: response.data.data });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Login failed",
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    set({ isLoggedIn: false, user: null, pendingUser: null });
  },

  // Check session / refresh
  checkAuth: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/auth/refresh-token");
      set({ isLoggedIn: true, user: res.data.data, loading: false });
    } catch {
      set({ isLoggedIn: false, user: null, loading: false });
    }
  },

  // Optional signup
  signupUser: async (email, phone, password, role) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        phone,
        password,
        role,
      });
      set({
        pendingUser: { id: response.data.data.userid, email, phone, role },
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Signup failed",
      };
    }
  },
}));

export default useAuthStore;
