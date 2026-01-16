import Profile from "./pages/Profile";
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useRestaurantAuthStore from "./store/restaurant/authStore";
import useAdminAuthStore from "./store/admin/authStore";
import useCustomerAuthStore from "./store/customer/authStore";
import useDriverAuthStore from "./store/driver/authStore";

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
import CustomerOrderMapPage from "./pages/customer/OrderMapPage";
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
import RestaurantDriverMapPage from "./pages/restaurant/DriverMapPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import RestaurantManagement from "./pages/admin/RestaurantManagement";
import PendingRestaurants from "./pages/admin/PendingRestaurant";
import { AdminLogin } from "./pages/admin/Login";
import AdminLiveTracking from "./pages/admin/LiveTracking";

// Driver Pages
import DriverOrders from "./pages/driver/DriverOrders";
import LoginPage from "./pages/driver/Login";
import DriverVerificationCode from "./components/driver/VerificationCode";
import DriverEarnings from "./pages/driver/DriverEarnings";
import DriverOrderStatus from "./pages/driver/DriverOrderStatus";
import OrderMapPage from "./pages/driver/OrderMapPage";

function App() {
  const { checkAuth: checkRestaurantAuth } = useRestaurantAuthStore();
  const { checkAuth: checkAdminAuth } = useAdminAuthStore();
  const { checkAuth: checkCustomerAuth } = useCustomerAuthStore();
  const { checkAuth: checkDriverAuth } = useDriverAuthStore();

  // Check HTTP-only cookie auth on app load
  useEffect(() => {
    // Best-effort: whichever role is logged in will succeed.
    checkRestaurantAuth();
    checkAdminAuth();
    checkCustomerAuth();
    checkDriverAuth();
  }, [checkRestaurantAuth, checkAdminAuth, checkCustomerAuth, checkDriverAuth]);

  const AnyPrivateRoute = ({ children }) => {
    const restaurant = useRestaurantAuthStore();
    const admin = useAdminAuthStore();
    const customer = useCustomerAuthStore();
    const driver = useDriverAuthStore();

    const loading =
      restaurant.loading || admin.loading || customer.loading || driver.loading;
    const isLoggedIn =
      restaurant.isLoggedIn || admin.isLoggedIn || customer.isLoggedIn || driver.isLoggedIn;

    if (loading)
      return (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      );

    if (!isLoggedIn) return <Navigate to="/login" replace />;

    return children;
  };

  const CustomerPrivateRoute = ({ children }) => {
    const { isLoggedIn, loading, role } = useCustomerAuthStore();

    if (loading)
      return (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      );

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (role && role !== "customer") return <Navigate to="/login" replace />;

    return children;
  };

  const RestaurantPrivateRoute = ({ children }) => {
    const { isLoggedIn, loading, role } = useRestaurantAuthStore();

    if (loading)
      return (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      );

    if (!isLoggedIn) return <Navigate to="/restaurant/login" replace />;
    if (role && role !== "restaurant") return <Navigate to="/restaurant/login" replace />;

    return children;
  };

  const AdminPrivateRoute = ({ children }) => {
    const { isLoggedIn, loading, user } = useAdminAuthStore();

    if (loading)
      return (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      );

    if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
    if (user?.role && user.role !== "admin") return <Navigate to="/admin/login" replace />;

    return children;
  };

  const DriverPrivateRoute = ({ children }) => {
    const { isLoggedIn, loading, role } = useDriverAuthStore();

    if (loading)
      return (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      );

    if (!isLoggedIn) return <Navigate to="/driver/login" replace />;
    if (role && role !== "driver") return <Navigate to="/driver/login" replace />;

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
          <Route
            path="/order-history"
            element={
              <CustomerPrivateRoute>
                <OrderHistory />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <CustomerPrivateRoute>
                <FeedbackPage />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/nearby"
            element={
              <CustomerPrivateRoute>
                <NearbyRestaurants />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/sidebar"
            element={
              <CustomerPrivateRoute>
                <Sidebar />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/menu/:restaurantId"
            element={
              <CustomerPrivateRoute>
                <MenuPage />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <CustomerPrivateRoute>
                <CartPage />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerPrivateRoute>
                <CheckoutPage />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <CustomerPrivateRoute>
                <OrderConfirmationPage />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <CustomerPrivateRoute>
                <OrderStatus />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/orders/:orderId/map"
            element={
              <CustomerPrivateRoute>
                <CustomerOrderMapPage />
              </CustomerPrivateRoute>
            }
          />
          <Route
            path="/order-status"
            element={
              <CustomerPrivateRoute>
                <OrderStatus />
              </CustomerPrivateRoute>
            }
          />

            <Route
            path="/profile"
            element={
              <AnyPrivateRoute>
                <Profile />
              </AnyPrivateRoute>
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
              <RestaurantPrivateRoute>
                <Dashboard />
              </RestaurantPrivateRoute>
            }
          />
          <Route
            path="/restaurant/menu"
            element={
              <RestaurantPrivateRoute>
                <AddMenuItem />
              </RestaurantPrivateRoute>
            }
          />
          <Route
            path="/MenuManagement/:restaurantId"
            element={
              <RestaurantPrivateRoute>
                <MenuManagement />
              </RestaurantPrivateRoute>
            }
          />
          <Route
            path="/inventory/:restaurantId"
            element={
              <RestaurantPrivateRoute>
                <InventoryPage />
              </RestaurantPrivateRoute>
            }
          />
          <Route
            path="/restaurant/create"
            element={
              <RestaurantPrivateRoute>
                <CreateDriver />
              </RestaurantPrivateRoute>
            }
          />
          <Route
            path="/restaurant/status"
            element={
              <RestaurantPrivateRoute>
                <StatsDashboard />
              </RestaurantPrivateRoute>
            }
          />
          <Route
            path="/restaurant/active-drivers"
            element={
              <RestaurantPrivateRoute>
                <ActiveDriversPage />
              </RestaurantPrivateRoute>
            }
          />
          <Route
            path="/restaurant/drivers/:driverId/map"
            element={
              <RestaurantPrivateRoute>
                <RestaurantDriverMapPage />
              </RestaurantPrivateRoute>
            }
          />
          <Route
            path="/restaurant/assign-driver"
            element={
              <RestaurantPrivateRoute>
                <AssignDriverPage />
              </RestaurantPrivateRoute>
            }
          />

          {/* Driver Pages (like customer, no role check) */}
          <Route path="/driver/login" element={<LoginPage />} />
          <Route path="/driver/verify" element={<DriverVerificationCode />} />
          <Route path="/driver/orders/:driverId" element={<DriverOrders />} />
          <Route
            path="/driver/status/:driverId"
            element={
              <DriverPrivateRoute>
                <DriverOrderStatus />
              </DriverPrivateRoute>
            }
          />
          <Route
            path="/driver/orders/:orderId/map"
            element={
              <DriverPrivateRoute>
                <OrderMapPage />
              </DriverPrivateRoute>
            }
          />
          <Route
            path="/driver/earnings"
            element={
              <DriverPrivateRoute>
                <DriverEarnings />
              </DriverPrivateRoute>
            }
          />
          <Route
            path="/driver/orders/:driverId"
            element={
              <DriverPrivateRoute>
                <DriverOrders />
              </DriverPrivateRoute>
            }
          />

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
              <AdminPrivateRoute>
                <AdminDashboard />
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminPrivateRoute>
                <UserManagement />
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <AdminPrivateRoute>
                <RestaurantManagement />
              </AdminPrivateRoute>
            }
          />
          <Route
            path="/admin/live-tracking"
            element={
              <AdminPrivateRoute>
                <AdminLiveTracking />
              </AdminPrivateRoute>
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
