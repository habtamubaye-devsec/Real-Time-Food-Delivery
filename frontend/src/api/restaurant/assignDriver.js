import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ important for httpOnly cookies
});

// ---- API Endpoints ----
export const fetchOrders = async (restaurantId) => {
  const res = await api.get(`/restaurants/${restaurantId}/orders`);
  return res.data.orders || [];
};

export const fetchActiveDrivers = async (restaurantId) => {
  const res = await api.get(`/restaurants/${restaurantId}/active-drivers`);
  return res.data.drivers || [];
};

export const assignDriver = async (orderId, driverId) => {
  const res = await api.post(`/restaurants/assign-driver`, { orderId, driverId });
  return res.data;
};
