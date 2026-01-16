import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../../components/admin/siderbar";
import { getSocket } from "../../realtime/socket";
import MultiMarkerMap from "../../components/maps/MultiMarkerMap";
import { distanceKm } from "../../utils/geo";

export default function AdminLiveTracking() {
  const [drivers, setDrivers] = useState({});
  const [destinations, setDestinations] = useState({});
  const destinationCache = useRef(new Map());

  const ensureDestination = async (orderId) => {
    if (!orderId) return;
    if (destinationCache.current.has(orderId)) return;

    destinationCache.current.set(orderId, null);
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
        const dest = { lat: coords[1], lng: coords[0] };
        destinationCache.current.set(orderId, dest);
        setDestinations((prev) => ({ ...prev, [orderId]: dest }));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const socket = getSocket();

    const onLocation = (evt) => {
      if (!evt?.driverId || !evt?.location) return;
      if (evt.orderId) ensureDestination(evt.orderId);
      setDrivers((prev) => ({
        ...prev,
        [evt.driverId]: {
          driverId: evt.driverId,
          latitude: evt.location.latitude,
          longitude: evt.location.longitude,
          updatedAt: evt.updatedAt,
          orderId: evt.orderId,
        },
      }));
    };

    socket.on("driver:location", onLocation);

    return () => {
      socket.off("driver:location", onLocation);
    };
  }, []);

  const rows = useMemo(() => Object.values(drivers), [drivers]);

  const rowsWithDistance = useMemo(() => {
    return rows.map((r) => {
      const dest = r.orderId ? destinations[r.orderId] : null;
      const driverLoc = {
        lat: Number(r.latitude),
        lng: Number(r.longitude),
      };
      const km = dest ? distanceKm(driverLoc, dest) : null;
      return { ...r, km };
    });
  }, [rows, destinations]);

  const markers = useMemo(
    () =>
      rows
        .filter((r) => Number.isFinite(r?.latitude) && Number.isFinite(r?.longitude))
        .map((r) => ({
          key: r.driverId,
          lat: r.latitude,
          lng: r.longitude,
          label: r.orderId ? `Driver ${r.driverId} (Order ${r.orderId})` : `Driver ${r.driverId}`,
        })),
    [rows]
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 ml-24">
        <h1 className="text-2xl font-bold mb-4">Live Driver Tracking</h1>
        <p className="text-sm text-gray-600 mb-6">
          Updates appear in real time when drivers share location.
        </p>

        {rowsWithDistance.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Waiting for driver locations…</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow">
              <MultiMarkerMap markers={markers} />
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow">
              <table className="min-w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Latitude</th>
                    <th className="p-3">Longitude</th>
                    <th className="p-3">Order</th>
                    <th className="p-3">Distance (km)</th>
                    <th className="p-3">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsWithDistance
                    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
                    .map((r) => (
                      <tr key={r.driverId} className="border-t">
                        <td className="p-3 font-mono text-xs">{r.driverId}</td>
                        <td className="p-3">{Number(r.latitude).toFixed?.(6) ?? r.latitude}</td>
                        <td className="p-3">{Number(r.longitude).toFixed?.(6) ?? r.longitude}</td>
                        <td className="p-3 font-mono text-xs">{r.orderId || "—"}</td>
                        <td className="p-3">{Number.isFinite(r.km) ? r.km.toFixed(2) : "—"}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {r.updatedAt ? new Date(r.updatedAt).toLocaleTimeString() : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
