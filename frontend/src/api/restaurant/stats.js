// src/api/restaurant/stats.js
const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

export const fetchRestaurantOrders = async (restaurantId) => {
  try {
    const res = await fetch(
      `${API_URL}/restaurants/${restaurantId}/orders`,
      { method: "GET", credentials: "include" } // HttpOnly cookie
    );
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to fetch orders");
    }
    return await res.json();
  } catch (err) {
    console.error("API Fetch Orders Error:", err.message);
    throw err;
  }
};

export const fetchRestaurantStats = async (restaurantId) => {
  try {
    const res = await fetch(
      `${API_URL}/restaurants/${restaurantId}/stats`,
      { method: "GET", credentials: "include" } // HttpOnly cookie
    );
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to fetch stats");
    }
    return await res.json();
  } catch (err) {
    console.error("API Fetch Stats Error:", err.message);
    throw err;
  }
};
