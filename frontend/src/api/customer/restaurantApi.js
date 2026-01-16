// src/api/restaurantApi.js
export const fetchNearbyRestaurants = async (lat, lng) => {
  const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";
  const url = lat && lng
    ? `${API_URL}/restaurants?lat=${lat}&lng=${lng}`
    : `${API_URL}/restaurants`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include", // ✅ send HttpOnly cookie automatically
  });

  if (!response.ok) {
    throw new Error("Failed to fetch restaurants");
  }

  return await response.json();
};
