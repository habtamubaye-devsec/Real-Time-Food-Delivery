import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MultiMarkerMap({ markers = [], height = 520, zoom = 12 }) {
  const normalized = useMemo(
    () => (markers || []).filter((m) => Number.isFinite(m?.lat) && Number.isFinite(m?.lng)),
    [markers]
  );

  const center = useMemo(() => {
    if (normalized.length === 0) return null;
    const lat = normalized.reduce((sum, m) => sum + m.lat, 0) / normalized.length;
    const lng = normalized.reduce((sum, m) => sum + m.lng, 0) / normalized.length;
    return [lat, lng];
  }, [normalized]);

  if (!center) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-600">Waiting for driver locations…</p>
      </div>
    );
  }

  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {normalized.map((m) => (
        <Marker key={m.key || `${m.lat}:${m.lng}`} position={[m.lat, m.lng]}>
          <Popup>{m.label || "Driver"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
