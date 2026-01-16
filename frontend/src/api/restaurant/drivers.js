// src/api/restaurant/drivers.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

export const registerDriver = async (driverData) => {
  try {
    const res = await axios.post(
      `${API_URL}/drivers/register`,
      driverData,
      { withCredentials: true } // HttpOnly cookie
    );

    if (res.data.status !== "success") {
      throw new Error(res.data.message || "Failed to register driver");
    }

    return res.data.data.user;
  } catch (err) {
    console.error("API Register Driver Error:", err.response?.data?.message || err.message);
    throw err;
  }
};
