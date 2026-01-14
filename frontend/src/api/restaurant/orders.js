// src/api/restaurant/orders.js
const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

export const fetchRestaurantOrders = async (restaurantId) => {
  try {
    const res = await fetch(
      `${API_URL}/restaurants/${restaurantId}/orders`,
      {
        method: "GET",
        credentials: "include", // 🔑 HttpOnly cookie usage
      }
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch orders");
    }
    return await res.json();
  } catch (err) {
    console.error("API Fetch Orders Error:", err.message);
    throw err;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const res = await fetch(
      `${API_URL}/orders/${orderId}/status`,
      {
        method: "POST",
        credentials: "include", // 🔑 HttpOnly cookie usage
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update order status");
    }
    return await res.json();
  } catch (err) {
    console.error("API Update Status Error:", err.message);
    throw err;
  }
};
