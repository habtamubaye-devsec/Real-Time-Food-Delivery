import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

const api = axios.create({
  baseURL: `${API_URL}/restaurants`,
  withCredentials: true,
});

export default api;
