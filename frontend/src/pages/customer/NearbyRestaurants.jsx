// src/pages/NearbyRestaurants.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useRestaurantStore from "../../store/customer/restaurantStore";
import Sidebar from "../../components/Sidebar";

const NearbyRestaurants = () => {
  const navigate = useNavigate();
  const {
    restaurants,
    filters,
    activeFilter,
    loading,
    error,
    fetchRestaurants,
    setActiveFilter,
  } = useRestaurantStore();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchRestaurants(latitude, longitude);
      },
      () => {
        fetchRestaurants();
      }
    );
  }, [fetchRestaurants]);

  const filteredRestaurants =
    activeFilter === "All"
      ? restaurants
      : restaurants.filter((r) => r.type === activeFilter);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-20 sm:w-24">
        <Sidebar />
      </div>

      <div className="flex-1 p-6 font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Explore Nearby</h1>
          <div className="text-gray-600 text-lg">📍 Addis Ababa</div>
        </div>

        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-3 mb-8">
          {loading ? (
            <p className="text-gray-600">Loading filters...</p>
          ) : (
            filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full border transition whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {filter}
              </button>
            ))
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading restaurants...</p>
        ) : filteredRestaurants.length === 0 ? (
          <p className="text-center text-gray-600">
            No nearby {activeFilter || "restaurants"} found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                onClick={() => navigate(`/menu/${restaurant._id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/menu/${restaurant._id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-[296px] cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="h-[64%] w-full">
                  <img
                    src={restaurant.image || "/placeholder.png"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-[25%] px-4 py-2 flex flex-col justify-between text-sm">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-semibold text-red-600 truncate">
                      {restaurant.name}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {restaurant.type}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-yellow-500">
                        {"⭐".repeat(Math.floor(restaurant.rating || 4))}
                      </div>
                      <span className="text-gray-500">
                        {restaurant.distance
                          ? `${(restaurant.distance / 1000).toFixed(2)} km`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center space-y-2">
                    <span className="text-xs text-gray-600">
                      {restaurant.timeEstimate || "20-30 min"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyRestaurants;
