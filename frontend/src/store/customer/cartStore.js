import { create } from "zustand";
import useMenuStore from "./menuStore";
import {
  fetchCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
} from "../../api/customer/cartApi";

const useCartStore = create((set, get) => ({
  cartItems: [],

  // ---------------- LOAD CART ----------------
  loadCart: async () => {
    const res = await fetchCartApi();
    if (res.success) {
      const backendItems = res.data?.items || [];
      const { menuItems } = useMenuStore.getState();

      const merged = backendItems.map((item) => {
        const menuMatch = menuItems.find((m) => m._id === item.menuItemId);
        return {
          _id: item._id,
          menuItemId: item.menuItemId,
          name: item.name || menuMatch?.name || "Unnamed",
          price: item.price || menuMatch?.price || 0,
          quantity: parseInt(item.quantity || 1, 10),
          image: item.image || menuMatch?.image || "/images/default-food.jpg",
          restaurantId: item.restaurantId,
        };
      });

      set({ cartItems: merged });
    }
    return res; // { success, message? }
  },

  // ---------------- ADD ITEM ----------------
  addToCart: async (item, restaurantId, quantity = 1) => {
    const res = await addToCartApi(restaurantId, item._id, quantity);
    if (res.success) {
      await get().loadCart();
    }
    return res;
  },

  // ---------------- UPDATE QUANTITY ----------------
  updateQuantity: async (cartId, quantity) => {
    const res = await updateCartItemApi(cartId, quantity);
    if (res.success) {
      await get().loadCart();
    }
    return res;
  },

  // ---------------- REMOVE SINGLE ITEM ----------------
  removeFromCart: async (cartId) => {
    const res = await removeFromCartApi(cartId);
    if (res.success) {
      await get().loadCart();
    }
    return res;
  },

  // ---------------- CLEAR CART ----------------
  clearCart: async () => {
    const restaurantId = get().cartItems?.[0]?.restaurantId?._id || null;
    if (!restaurantId) {
      set({ cartItems: [] });
      return { success: true, message: "Cart cleared locally" };
    }

    const res = await clearCartApi(restaurantId);
    if (res.success) {
      await get().loadCart();
    }
    return res;
  },

  // ---------------- HELPERS ----------------
  getTotalQuantity: () =>
    get().cartItems.reduce((sum, item) => sum + item.quantity, 0),

  getTotalPrice: () =>
    get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));

export default useCartStore;
