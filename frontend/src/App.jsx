import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Header from "./shared/components/layout/Header";
import Footer from "./shared/components/layout/Footer";
import { Home } from "./pages/Home";
import SignUp from "./pages/user/SignUp";
import { TermsService } from "./pages/TermsService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import SignIn from "./pages/user/SignIn";
import ResetPassword from "./pages/user/ResetPassword";
import Unauthorized from "./shared/components/fallback/Unauthorized";
import RestaurantMenuPage from "./pages/restaurant/RestaurantMenuPage";
import Profile from "./pages/user/Profile";
import { loadUser } from "./redux/actions/userAction";
import CartPage from "./pages/cart/CartPage";
import { Toaster } from "react-hot-toast";
import MyOrders from "./pages/orders/MyOrders";
import OrderDetails from "./pages/orders/OrderDetails";
import OrderSuccess from "./pages/cart/OrderSuccess";
import PaymentError from "./pages/paymant/PaymentError";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import RestaurantDashboard from "./pages/owner/RestaurantDashboard";
import CreateRestaurant from "./pages/owner/CreateRestaurant";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";

function App() {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.user);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        await dispatch(loadUser());
      }
      setInitialLoadComplete(true);
    };

    loadUserData();
  }, [dispatch]);

  if (!initialLoadComplete && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
            style: {
              background: "#10B981",
              color: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
            style: {
              background: "#EF4444",
              color: "#fff",
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: "#3B82F6",
              color: "#fff",
            },
          },
        }}
      />
      <Router>
        <Header />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/search/:keyword" element={<Home />} />
            <Route path="/restaurants" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantMenuPage />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<TermsService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/order-success/:orderId?" element={<OrderSuccess />} />
            <Route path="/payment/error/:orderId?" element={<PaymentError />} />

            <Route
              path="/owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={["restaurant_owner", "admin"]}>
                  <RestaurantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/restaurants/create"
              element={
                <ProtectedRoute allowedRoles={["restaurant_owner", "admin"]}>
                  <CreateRestaurant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/restaurants/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["restaurant_owner", "admin"]}>
                  <CreateRestaurant />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/restaurants"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminRestaurants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <Footer />
      </Router>
    </>
  );
}

export default App;
