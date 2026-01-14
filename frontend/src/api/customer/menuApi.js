// src/api/menuApi.js
const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";
const BASE_URL = `${API_URL}/restaurants`;

export const fetchMenuByRestaurantId = async (restaurantId) => {
  const response = await fetch(`${BASE_URL}/${restaurantId}`, {
    method: "GET",
    credentials: "include", // sends HttpOnly cookie automatically
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Unauthorized. Please login.");
    throw new Error("Failed to fetch restaurant menu");
  }

  return response.json();
};
