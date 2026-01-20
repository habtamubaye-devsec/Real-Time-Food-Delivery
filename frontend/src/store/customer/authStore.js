import { create } from "zustand";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  signupApi,
} from "../../api/customer/authApi";

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  user: null,
  pendingUser: null,
  role: null,
  loading: true,

  // ------------------- LOGIN -------------------
  login: async (email, password) => {
    set({ loading: true });
    const res = await loginApi(email, password);
    if (res.success) {
      set({ isLoggedIn: true, user: res.data, role: res.data?.role || "customer", loading: false });
    } else {
      set({ loading: false });
    }
    return res;
  },

  // ------------------- LOGOUT -------------------
  logout: async () => {
    await logoutApi();
    set({ isLoggedIn: false, user: null, pendingUser: null, role: null, loading: false });
  },

  // ------------------- CHECK SESSION -------------------
  checkAuth: async () => {
    set({ loading: true });
    const res = await refreshTokenApi();
    if (res.success) {
      set({ isLoggedIn: true, user: res.data, role: res.data?.role || "customer", loading: false });
    } else {
      set({ isLoggedIn: false, user: null, role: null, loading: false });
    }
    return res;
  },

  // ------------------- SIGNUP -------------------
  signupUser: async (email, phone, password, role) => {
    const res = await signupApi(email, phone, password, role);
    if (res.success) {
      set({
        pendingUser: {
          id: res.data.userid,
          email,
          phone,
          role,
        },
      });
    }
    return res;
  },
}));

export default useAuthStore;
