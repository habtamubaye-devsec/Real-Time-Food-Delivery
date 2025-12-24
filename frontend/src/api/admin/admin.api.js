// src/api/adminRestaurants.js
const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";
const API_BASE = `${API_URL}/admin/restaurants`;

export const fetchPendingRestaurantsAPI = async () => {
  const res = await fetch(`${API_BASE}/pending`, {
    method: "GET",
    credentials: "include", // include cookies
  });
  if (!res.ok) throw new Error("Failed to fetch pending restaurants");
  const json = await res.json();
  return json.data?.pending || [];
};

export const approveRestaurantAPI = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/verify`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    credentials: "include", // include cookies
  });
  if (!res.ok) throw new Error("Failed to approve restaurant");
};

export const rejectRestaurantAPI = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    credentials: "include", // include cookies
  });
  if (!res.ok) throw new Error("Failed to reject restaurant");
};
