import { create } from "zustand";
import { fetchUserInfoAPI } from "../api/user";

const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const userData = await fetchUserInfoAPI();
      set({ user: userData, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useUserStore;
