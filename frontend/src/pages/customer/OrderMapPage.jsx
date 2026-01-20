import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import OrderMap from "../../components/driver/OrderMap";
import { getSocket } from "../../realtime/socket";
import { distanceKm } from "../../utils/geo";

export default function CustomerOrderMapPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setError(errorData.message || "Order not found");
          return;
        }
        const json = await res.json();
        setOrder(json.data);
      } catch (e) {
        setError(e?.message || "Failed to load order");
      }
    };

    load();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();

    socket.emit("tracking:join:order", { orderId });

    const onLocation = (evt) => {
      if (!evt) return;
      if (evt.orderId && evt.orderId !== orderId) return;
      if (!evt.location) return;

      setDriverLocation({
        lat: evt.location.latitude,
        lng: evt.location.longitude,
      });
    };

    socket.on("driver:location", onLocation);

    return () => {
      socket.off("driver:location", onLocation);
    };
  }, [orderId]);

  const customerLocation = useMemo(() => {
    if (!order?.deliveryLocation?.coordinates) return null;
    return {
      lat: order.deliveryLocation.coordinates[1],
      lng: order.deliveryLocation.coordinates[0],
    };
  }, [order]);

  const km = useMemo(() => {
    if (!driverLocation || !customerLocation) return null;
    return distanceKm(driverLocation, customerLocation);
  }, [driverLocation, customerLocation]);

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-20 sm:w-24">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!order || !customerLocation) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-20 sm:w-24">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-20 sm:w-24">
        <Sidebar />
      </div>

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Live Delivery Tracking</h2>
        <p className="text-gray-600 mb-4">Order: {order._id}</p>

        {Number.isFinite(km) && (
          <div className="mb-4 bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Driver distance to destination</p>
            <p className="text-2xl font-bold">{km.toFixed(2)} km</p>
          </div>
        )}

        {!driverLocation && (
          <p className="text-sm text-gray-500 mb-3">
            Waiting for driver location...
          </p>
        )}

        <div className="bg-white p-4 rounded-xl shadow">
          <OrderMap
            driverLocation={driverLocation}
            customerLocation={customerLocation}
          />
        </div>
      </div>
    </div>
  );
}
