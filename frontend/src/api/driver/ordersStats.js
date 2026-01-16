import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

export const fetchDriverOrdersAPI = async (driverId) => {
  try {
    const res = await axios.get(
      `${API_URL}/drivers/${driverId}/orders`,
      { withCredentials: true }
    );
    return res.data.data.orders || [];
  } catch (err) {
    console.error("Fetch Driver Orders Error:", err.response?.data?.message || err.message);
    throw err;
  }
};
