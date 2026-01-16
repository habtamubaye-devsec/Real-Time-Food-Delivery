import React, { useEffect } from "react";
import useUserStore from "../store/userStore";
import AdminSidebar from "../components/admin/siderbar";
import CustomerSidebar from "../components/Sidebar";
import DriverSidebar from "../components/driver/Sidebar";
import RestaurantSidebar from "../components/restaurant/Sidebar";

export default function Profile() {
  const { user, loading, error, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const renderSidebar = () => {
    if (!user) return null;
    switch (user.role) {
      case "admin":
        return <AdminSidebar />;
      case "customer":
        return <CustomerSidebar />;
      case "driver":
        return <DriverSidebar />;
      case "restaurant":
        return <RestaurantSidebar />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-lg">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {renderSidebar()}
      <div className="flex-1 ml-20 sm:ml-24 p-6">
        <h2 className="text-3xl font-bold mb-6">User Profile</h2>
        {user && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-semibold">{user.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Role</p>
                <p className="font-semibold">{user.role}</p>
              </div>
              {user.role === "driver" && (
                <>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold">{user.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Restaurant ID</p>
                    <p className="font-semibold">{user.restaurantId}</p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4">
                Account Information
              </h3>
              <p className="text-gray-600">
                To edit your profile information, please contact support.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
