import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // for HttpOnly cookies
});

// ✅ Centralized error handler
const handleError = (err, defaultMsg) =>
  err.response?.data?.message || err.message || defaultMsg || "Something went wrong";

// ------------------- AUTH APIS -------------------

// Login
export const loginApi = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return { success: true, data: res.data.data };
  } catch (err) {
    return { success: false, message: handleError(err, "Login failed") };
  }
};

// Logout
export const logoutApi = async () => {
  try {
    await api.post("/auth/logout");
    return { success: true };
  } catch (err) {
    return { success: false, message: handleError(err, "Logout failed") };
  }
};

// Refresh session
export const refreshTokenApi = async () => {
  try {
    const res = await api.post("/auth/refresh-token");
    return { success: true, data: res.data.data };
  } catch (err) {
    return { success: false, message: handleError(err, "Session expired") };
  }
};

// Signup Restaurant
export const signupRestaurantApi = async (
  email,
  phone,
  password,
  name,
  lng,
  lat,
  image
) => {
  try {
    const payload = {
      email: String(email),
      phone: String(phone),
      password: String(password),
      name: String(name),
      image: String(image),
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    };

    const res = await api.post("/restaurants/register", payload);
    return { success: true, data: res.data.data, payload };
  } catch (err) {
    return { success: false, message: handleError(err, "Signup failed") };
  }
};
