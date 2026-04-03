import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./shared/components/layout/Header";
import Footer from "./shared/components/layout/Footer";
import { Home } from "./pages/Home";
import SignUp from "./pages/user/SignUp";
import { TermsService } from "./pages/TermsService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import SignIn from "./pages/user/SignIn";

function App() {
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
            <Route path="/sign-up" element={<SignUp />} exact />
            <Route path="/sign-in" element={<SignIn />} exact />
            <Route path="/terms" element={<TermsService />} exact />
            <Route path="/privacy" element={<PrivacyPolicy />} exact />
            <Route path="/footer" element={<Footer />} exact />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
