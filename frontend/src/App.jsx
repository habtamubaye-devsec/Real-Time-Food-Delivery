import Profile from "./pages/Profile";
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./store/restaurant/authStore";

// Customer Pages
import { Login } from "./pages/customer/Login";
import Signup from "./pages/customer/Signup";
import ForgotPassword from "./pages/customer/ForgotPassword";
import ResetPassword from "./pages/customer/ResetPassword";
import { Landing_Page } from "./pages/customer/Landing Page";
import VerificationCode from "./components/VerificationCode";
import OrderHistory from "./pages/customer/OrderHistory";
import FeedbackPage from "./pages/customer/FeedBack";
import NearbyRestaurants from "./pages/customer/NearbyRestaurants";
import Sidebar from "./components/Sidebar";
import MenuPage from "./pages/customer/MenuPage";
import CartPage from "./pages/customer/CartPage";
import OrderStatus from "./pages/customer/OrderStatus";
import CheckoutPage from "./pages/customer/CheckoutPage";
import OrderConfirmationPage from "./pages/customer/OrderConfirmationPage";

// Restaurant Pages
import RestaurantSignup from "./pages/restaurant/Signup";
import RestaurantVerificationCode from "./components/restaurant/VerificationCode";
import RestaurantLogin from "./pages/restaurant/Login";
import Dashboard from "./pages/restaurant/Dashboard";
import AddMenuItem from "./pages/restaurant/MenuManager";
import MenuManagement from "./pages/restaurant/MenuManagementpage";
import InventoryPage from "./pages/restaurant/InventoryPage";
import CreateDriver from "./pages/restaurant/createDriver";
import StatsDashboard from "./pages/restaurant/StatsDashboard";
import ActiveDriversPage from "./pages/restaurant/ActiveDriversPage";
import AssignDriverPage from "./pages/restaurant/AssignDriver";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import RestaurantManagement from "./pages/admin/RestaurantManagement";
import PendingRestaurants from "./pages/admin/PendingRestaurant";
import { AdminLogin } from "./pages/admin/Login";

// Driver Pages
import DriverOrders from "./pages/driver/DriverOrders";
import LoginPage from "./pages/driver/Login";
import DriverVerificationCode from "./components/driver/VerificationCode";
import DriverEarnings from "./pages/driver/DriverEarnings";
import DriverOrderStatus from "./pages/driver/DriverOrderStatus";
import OrderMapPage from "./pages/driver/OrderMapPage";

function App() {
  const { checkAuth } = useAuthStore();

  // Check HTTP-only cookie auth on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Protected route wrapper (only checks login, no role)
  const PrivateRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuthStore();

    if (loading)
      return (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      );

    if (!isLoggedIn) return <Navigate to="/restaurant/login" replace />;

    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-white/90">
        <Routes>
          {/* Customer Pages */}
          <Route path="/" element={<Landing_Page />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<VerificationCode />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/nearby" element={<NearbyRestaurants />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/menu/:restaurantId" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-confirmation"
            element={<OrderConfirmationPage />}
          />
            <Route path="/orders/:orderId" element={<OrderStatus />} />  
                        <Route path="/order-status" element={<OrderStatus />} />  

            <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Restaurant Pages */}
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/signup" element={<RestaurantSignup />} />
          <Route
            path="/restaurant/verify"
            element={<RestaurantVerificationCode />}
          />
          <Route
            path="/restaurant/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/restaurant/menu"
            element={
              <PrivateRoute>
                <AddMenuItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/MenuManagement/:restaurantId"
            element={
              <PrivateRoute>
                <MenuManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory/:restaurantId"
            element={
              <PrivateRoute>
                <InventoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/restaurant/create"
            element={
              <PrivateRoute>
                <CreateDriver />
              </PrivateRoute>
            }
          />
          <Route
            path="/restaurant/status"
            element={
              <PrivateRoute>
                <StatsDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/restaurant/active-drivers"
            element={
              <PrivateRoute>
                <ActiveDriversPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/restaurant/assign-driver"
            element={
              <PrivateRoute>
                <AssignDriverPage />
              </PrivateRoute>
            }
          />

          {/* Driver Pages (like customer, no role check) */}
          <Route path="/driver/login" element={<LoginPage />} />
          <Route path="/driver/verify" element={<DriverVerificationCode />} />
          <Route path="/driver/orders/:driverId" element={<DriverOrders />} />
          <Route
            path="/driver/status/:driverId"
            element={<DriverOrderStatus />}
          />
          <Route
            path="/driver/orders/:orderId/map"
            element={<OrderMapPage />}
          />
          <Route path="/driver/earnings" element={<DriverEarnings />} />

          {/* Admin Pages */}
          <Route
            path="/admin/login"
            element={
              
                <AdminLogin />
              
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <PrivateRoute>
                <RestaurantManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/pending"
            element={
              
                <PendingRestaurants />
              
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
