import axios from "axios";

// Use same-origin by default (works with Vite dev-server proxy in vite.config.js).
// In production, set VITE_API_URL to the full backend URL (e.g. https://.../api/delivery).
const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for HttpOnly cookies
});


export default api;
