import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

export const fetchActiveDrivers = async (restaurantId) => {
  try {
    const res = await axios.get(
      `${API_URL}/restaurants/${restaurantId}/active-drivers`,
      { withCredentials: true }
    );
    return res.data.drivers || [];
  } catch (err) {
    console.error("Error fetching active drivers:", err);
    throw new Error("Failed to load active drivers");
  }
};
