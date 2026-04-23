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
import { loadUser } from "./redux/actions/userAction";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token found in localStorage:", !!token);

    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);
  return (
    <>
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
            <Route path="/restaurant/:id" element={<RestaurantMenuPage />} />
            <Route path="/sign-up" element={<SignUp />} exact />
            <Route path="/sign-in" element={<SignIn />} exact />
            <Route path="/forgot-password" element={<ResetPassword />} />
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
