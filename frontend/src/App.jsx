import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./shared/components/layout/Header";
import Footer from "./shared/components/layout/Footer";
import { Home } from "./pages/Home";

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
            <Route path="/footer" element={<Footer />} exact />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
