import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/restaurants", label: "Restaurants", icon: "🍽️" },
    { to: "/about", label: "About", icon: "ℹ️" },
  ];

  const authLinks = isAuthenticated
    ? [
        { to: "/sign-out", label: "SignOut", icon: "📊" },
        { to: "/profile", label: "Profile", icon: "👤" },
      ]
    : [
        { to: "/sign-up", label: "Sign Up", icon: "📊" },
        { to: "/sign-in", label: "Sign In", icon: "👤" },
      ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${
          isScrolled
            ? "bg-red-500 shadow-lg backdrop-blur-md bg-opacity-95"
            : "bg-linear-to-r from-blue-600 to-purple-600"
        }
      `}
    >
      <div className="flex justify-between  items-center py-2">
        <div>
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold transition-transform hover:scale-105"
          >
            <span className={isScrolled ? "text-blue-600" : "text-white"}>
              Foodie
            </span>
            <span className={isScrolled ? "text-gray-700" : "text-white"}>
              Express
            </span>
          </Link>
        </div>
        <div className="hidden md:flex justify-between items-center space-x-1">
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2
                  ${
                    isActive
                      ? isScrolled
                        ? "bg-emerald-400 text-blue-600"
                        : "bg-emerald-400 bg-opacity-20 text-white"
                      : isScrolled
                        ? "text-gray-700 hover:bg-emerald-400"
                        : "bg-emerald-400 hover:bg-emerald-400 hover:bg-opacity-10"
                  }
                `}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
          <div>cart</div>
          <div className="flex">
            {authLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2
                  ${
                    isActive
                      ? isScrolled
                        ? "bg-sky-700 text-blue-600"
                        : "bg-sky-700 bg-opacity-20 text-pink-500"
                      : isScrolled
                        ? "text-gray-700 hover:bg-sky-700"
                        : "text-white hover:bg-red-400 hover:bg-opacity-10"
                  }
                `}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
