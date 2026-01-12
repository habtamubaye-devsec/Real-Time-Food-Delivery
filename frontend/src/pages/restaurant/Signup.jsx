import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useAuthStore from "../../store/restaurant/authStore";

// Fix Leaflet default marker
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

// Component to pick location on map
function LocationMarker({ setForm }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setForm((prev) => ({
        ...prev,
        lat: e.latlng.lat.toFixed(6),
        lng: e.latlng.lng.toFixed(6),
      }));
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Restaurant Location</Popup>
    </Marker>
  ) : null;
}

const RestaurantSignup = () => {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    name: "",
    lng: "",
    lat: "",
    image: "",
  });

  const { signupRestaurant } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password.trim() ||
      !form.name.trim() ||
      isNaN(parseFloat(form.lng)) ||
      isNaN(parseFloat(form.lat)) ||
      !form.image.trim()
    ) {
      setLoading(false);
      setError("Please fill all fields correctly");
      return;
    }

    const { success, message } = await signupRestaurant(
      form.email,
      form.phone,
      form.password,
      form.name,
      form.lng,
      form.lat,
      form.image
    );

    setLoading(false);

    if (success) navigate("/restaurant/login");
    else setError(message);
  };

  const isFormValid =
    form.email && form.phone && form.password && form.name && form.lng && form.lat && form.image;

  return (
    <div className="min-h-screen  flex items-center justify-center p-6 ">
      <div className="grid md:grid-cols-2 w-full max-w-7xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* LEFT → Map Section */}
        <div className="relative">
          <MapContainer center={[9.03, 38.74]} zoom={13} className="h-full min-h-[650px] w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker setForm={setForm} />
          </MapContainer>
          <div className="absolute top-5 left-5 bg-white px-4 py-2 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800">📍 Pick Restaurant Location</h2>
            <p className="text-xs text-gray-500">Click on the map to set coordinates</p>
          </div>
        </div>

        {/* RIGHT → Signup Form */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Register Restaurant</h1>
          <p className="text-gray-500 text-sm mb-8">
            Fill the details below to create your restaurant account.
          </p>

          <form className="space-y-8" onSubmit={handleSignup}>
            {/* Section 1: Account Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">👤 Account Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Section 2: Restaurant Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">🍽️ Restaurant Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Restaurant Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                  }
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none"
                  required
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Longitude"
                  value={form.lng}
                  readOnly
                  className="px-4 py-3 border rounded-xl bg-gray-100 text-gray-600"
                />
                <input
                  type="text"
                  placeholder="Latitude"
                  value={form.lat}
                  readOnly
                  className="px-4 py-3 border rounded-xl bg-gray-100 text-gray-600"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Image Preview */}
            {form.image && (
              <div className="flex items-center gap-4">
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg shadow-md border"
                />
                <span className="text-sm text-gray-500">Restaurant Logo Preview</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-400 text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

            <p className="text-sm text-center mt-6 text-gray-600">
              Already have an account?{" "}
              <Link
                to="/restaurant/login"
                className="text-red-500 font-medium ml-1 hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignup;
