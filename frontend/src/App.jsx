import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
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

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
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
        <div>
          <Routes>
            <Route path="/" element={<Home />} exact />
            <Route
              path="/restaurant/search/:keyword"
              element={<Home />}
              exact
            />
            <Route path="/cart" element={<CartPage />} exact />
            <Route path="/restaurant/:id" element={<RestaurantMenuPage />} />
            <Route path="/sign-up" element={<SignUp />} exact />
            <Route path="/sign-in" element={<SignIn />} exact />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/payment/error/:orderId?" element={<PaymentError />} />
            <Route path="/checkout" element={<PaymentError />} />
            <Route path="/terms" element={<TermsService />} exact />
            <Route path="/privacy" element={<PrivacyPolicy />} exact />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </>
  );
}

export default App;
