// src/store/pendingRestaurantsStore.js
import { useState } from "react";
import {
  fetchPendingRestaurantsAPI,
  approveRestaurantAPI,
  rejectRestaurantAPI
} from "../../api/admin/admin.api";

export const usePendingRestaurantsStore = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPendingRestaurantsAPI();
      setPendingRestaurants(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pending restaurants");
    } finally {
      setLoading(false);
    }
  };

  const approveRestaurant = async (id) => {
    try {
      setLoading(true);
      await approveRestaurantAPI(id);
      await fetchPendingRestaurants();
    } catch (err) {
      console.error(err);
      alert("Failed to approve restaurant");
    } finally {
      setLoading(false);
    }
  };

  const rejectRestaurant = async (id) => {
    try {
      setLoading(true);
      await rejectRestaurantAPI(id);
      await fetchPendingRestaurants();
    } catch (err) {
      console.error(err);
      alert("Failed to reject restaurant");
    } finally {
      setLoading(false);
    }
  };

  return {
    pendingRestaurants,
    loading,
    error,
    fetchPendingRestaurants,
    approveRestaurant,
    rejectRestaurant
  };
};
