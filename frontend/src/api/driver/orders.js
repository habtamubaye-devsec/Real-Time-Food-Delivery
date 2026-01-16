// API functions for driver orders
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://real-time-food-delivery.onrender.com/api/delivery";

export const fetchDriverOrdersAPI = async (driverId) => {
  try {
    const res = await axios.get(
      `${API_URL}/drivers/${driverId}/orders`,
      { withCredentials: true }
    );
    return res.data.data; // { driver, orders }
  } catch (err) {
    console.error(
      "Fetch Driver Orders Error:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};

export const fetchDriverEarningsAPI = async (driverId) => {
  try {
    const res = await axios.get(
      `${API_URL}/drivers/${driverId}/earnings`,
      { withCredentials: true }
    );
    return res.data.data;
  } catch (err) {
    console.error(
      "Fetch Driver Earnings Error:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};

export const updateDriverStatusAPI = async (status) => {
  try {
    const res = await axios.patch(
      `${API_URL}/drivers/status`,
      { status },
      { withCredentials: true }
    );
    return res.data.data.driver;
  } catch (err) {
    console.error(
      "Update Driver Status Error:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};

export const updateOrderStatusAPI = async (orderId, status) => {
  try {
    await axios.post(
      `${API_URL}/orders/${orderId}/status`,
      { status },
      { withCredentials: true }
    );
  } catch (err) {
    console.error(
      "Update Order Status Error:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};
