import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

export const fetchDriverEarningsAPI = async (driverId) => {
  try {
    const res = await axios.get(
      `${API_URL}/drivers/${driverId}/earnings`,
      { withCredentials: true }
    );
    return res.data.data;
  } catch (err) {
    console.error("Fetch Driver Earnings Error:", err.response?.data?.message || err.message);
    throw err;
  }
};
