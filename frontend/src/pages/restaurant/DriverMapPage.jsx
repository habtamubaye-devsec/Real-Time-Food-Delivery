import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/restaurant/Sidebar";
import { getSocket } from "../../realtime/socket";
import SingleMarkerMap from "../../components/maps/SingleMarkerMap";
import { distanceKm } from "../../utils/geo";

export default function RestaurantDriverMapPage() {
  const { driverId } = useParams();
  const [driverLocation, setDriverLocation] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    if (!driverId) return;

    const socket = getSocket();

    socket.emit("tracking:join:driver", { driverId });

    const onLocation = (evt) => {
      if (!evt?.driverId || evt.driverId !== driverId) return;
      if (!evt.location) return;

      setDriverLocation({
        lat: evt.location.latitude,
        lng: evt.location.longitude,
      });

      if (evt.orderId) setOrderId(evt.orderId);
    };

    socket.on("driver:location", onLocation);

    return () => {
      socket.off("driver:location", onLocation);
    };
  }, [driverId]);

  useEffect(() => {
    const loadDestination = async () => {
      if (!orderId) return;
      try {
        const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) return;
        const json = await res.json();
        const coords = json?.data?.deliveryLocation?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          setDestination({ lat: coords[1], lng: coords[0] });
        }
      } catch {
        // ignore
      }
    };

    loadDestination();
  }, [orderId]);

  const label = useMemo(() => `Driver: ${driverId}`, [driverId]);

  const km = useMemo(() => {
    if (!driverLocation || !destination) return null;
    return distanceKm(driverLocation, destination);
  }, [driverLocation, destination]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20 sm:ml-24 p-6">
        <h1 className="text-2xl font-bold mb-4">Driver Live Tracking</h1>
        <p className="text-sm text-gray-600 mb-4">{label}</p>

        {orderId && (
          <p className="text-sm text-gray-600 mb-2">
            Active order: <span className="font-mono text-xs">{orderId}</span>
          </p>
        )}

        {Number.isFinite(km) && (
          <div className="mb-4 bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Driver distance to destination</p>
            <p className="text-2xl font-bold">{km.toFixed(2)} km</p>
          </div>
        )}
        <div className="bg-white p-4 rounded-xl shadow">
          <SingleMarkerMap marker={driverLocation} label={label} />
        </div>
      </div>
    </div>
  );
}
