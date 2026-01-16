// src/pages/admin/PendingRestaurants.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/siderbar";
import { usePendingRestaurantsStore } from "../../store/admin/pending";

const PendingRestaurants = () => {
  const {
    pendingRestaurants,
    loading,
    error,
    fetchPendingRestaurants,
    approveRestaurant,
    rejectRestaurant
  } = usePendingRestaurantsStore();

  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const filteredRestaurants = pendingRestaurants.filter((r) =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col justify-between items-center mb-4 gap-4 p-6">
          <h2 className="text-3xl font-bold text-center text-black mb-4">
            Pending Restaurants
          </h2>
          <div className="flex items-center w-3/5 gap-4">
            <input
              type="text"
              placeholder="search restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-[4] border border-gray-300 rounded-md px-4 py-2 
              focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={() => setSearchTerm(searchTerm.trim())}
              className="flex-[0.75] bg-red-500 text-white px-10 py-2
              rounded-md border-none font-semibold"
            >
              Search
            </button>
          </div>
          {error && <p className="mt-2 text-red-500 font-medium">{error}</p>}
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
          {loading ? (
            <p className="text-center p-4">Loading...</p>
          ) : (
            <table className="table-auto w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left w-1/4">Name</th>
                  <th className="p-2 text-left">Address</th>
                  <th className="p-2 text-left">Cuisine</th>
                  <th className="p-2 text-left">Contact</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((r) => (
                    <tr key={r._id} className="border-b">
                      <td className="p-2 flex items-center gap-2">
                        <img 
                          src={r.image || "https://via.placeholder.com/40"} 
                          alt={r.name} 
                          className="w-12 h-12 rounded-lg object-cover" 
                        />
                        <span className="font-medium">{r.name}</span>
                      </td>
                      <td className="p-2">
                        {r.address || `${r.location?.coordinates[1]}, ${r.location?.coordinates[0]}`}
                      </td>
                      <td className="p-2">{r.cuisine || "N/A"}</td>
                      <td className="p-2">{r.contact || "+251 900000000"}</td>
                      <td className="p-2">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => approveRestaurant(r._id)}
                            className="bg-green-500 text-white font-semibold rounded-md px-5 py-2 hover:bg-green-600"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectRestaurant(r._id)}
                            className="bg-red-500 text-white font-semibold rounded-md px-5 py-2 hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      No pending restaurants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingRestaurants;
