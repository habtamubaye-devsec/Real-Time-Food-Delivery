import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function SingleMarkerMap({
  marker,
  label = "Location",
  height = 420,
  zoom = 14,
}) {
  const center = useMemo(() => {
    if (!marker) return null;
    return [marker.lat, marker.lng];
  }, [marker]);

  if (!center) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-600">Waiting for live location…</p>
      </div>
    );
  }

  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center}>
        <Popup>{label}</Popup>
      </Marker>
    </MapContainer>
  );
}
