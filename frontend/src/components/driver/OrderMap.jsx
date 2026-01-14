import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// Leaflet's default icon doesn't work well with React, so we fix it
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const Routing = ({ driverLocation, customerLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !driverLocation || !customerLocation) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(driverLocation.lat, driverLocation.lng),
        L.latLng(customerLocation.lat, customerLocation.lng),
      ],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: "#6FA1EC", weight: 4 }],
      },
      show: false, // hide the turn-by-turn instructions
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, driverLocation, customerLocation]);

  return null;
};

const OrderMap = ({ driverLocation, customerLocation }) => {
  if (!driverLocation || !customerLocation) {
    return <div>Loading map data...</div>;
  }

  const center = [
    (driverLocation.lat + customerLocation.lat) / 2,
    (driverLocation.lng + customerLocation.lng) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[driverLocation.lat, driverLocation.lng]}>
        <Popup>Your Location</Popup>
      </Marker>
      <Marker position={[customerLocation.lat, customerLocation.lng]}>
        <Popup>Customer's Location</Popup>
      </Marker>
      <Routing
        driverLocation={driverLocation}
        customerLocation={customerLocation}
      />
    </MapContainer>
  );
};

export default OrderMap;
