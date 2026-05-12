import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/actions/userAction";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, loading } = useSelector((state) => state.user);
  const { itemCount } = useSelector((state) => state.cart || { itemCount: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu")) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      if (
        window.location.pathname !== "/sign-in" &&
        window.location.pathname !== "/sign-up"
      ) {
        navigate("/sign-in");
      }
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/sign-in");
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/restaurants", label: "Restaurants" },
    { to: "/about", label: "About" },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${
            isScrolled
              ? "bg-white shadow-lg"
              : "bg-linear-to-r from-orange-600 to-orange-700"
          }
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold transition-transform hover:scale-105"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={isScrolled ? "text-orange-600" : "text-white"}>
                Food
              </span>
              <span className={isScrolled ? "text-gray-700" : "text-white"}>
                Delivery
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2
                    ${
                      isActive
                        ? isScrolled
                          ? "bg-orange-100 text-orange-600"
                          : "bg-white/20 text-white"
                        : isScrolled
                          ? "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                          : "text-white/90 hover:bg-white/10"
                    }
                  `}
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/cart"
                className={`
                  relative p-2 rounded-lg transition-colors
                  ${
                    isScrolled
                      ? "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                      : "text-white hover:bg-white/10"
                  }
                `}
              >
                <ShoppingBagIcon className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-2">
                    {user?.profile_pic?.url ? (
                      <img
                        src={user.profile_pic.url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-semibold
                        ${isScrolled ? "bg-orange-100 text-orange-600" : "bg-white/20 text-white"}
                      `}
                      >
                        {getInitials(user?.name)}
                      </div>
                    )}
                    <span
                      className={`hidden lg:inline ${isScrolled ? "text-gray-700" : "text-white"}`}
                    >
                      {user?.name?.split(" ")[0]}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    className={`
                      px-3 py-2 rounded-lg transition-colors text-sm font-medium
                      ${
                        isScrolled
                          ? "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                          : "text-white hover:bg-white/10"
                      }
                    `}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`
                      flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium
                      ${
                        isScrolled
                          ? "text-red-600 hover:bg-red-50"
                          : "text-white hover:bg-white/10"
                      }
                    `}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/sign-in"
                    className={`
                      px-4 py-2 rounded-lg transition-all duration-200
                      ${
                        isScrolled
                          ? "text-orange-600 border border-orange-600 hover:bg-orange-50"
                          : "text-white border border-white hover:bg-white/10"
                      }
                    `}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    className={`
                      px-4 py-2 rounded-lg transition-all duration-200
                      ${
                        isScrolled
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "bg-white text-orange-600 hover:bg-gray-100"
                      }
                    `}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`
                md:hidden p-2 rounded-lg transition-colors
                ${isScrolled ? "text-gray-700" : "text-white"}
              `}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="mobile-menu fixed inset-x-0 top-[60px] z-40 bg-white shadow-lg md:hidden animate-slideDown">
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <span className="font-medium">{link.label}</span>
              </NavLink>
            ))}

            <hr className="my-2" />
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="font-medium">Cart</span>
              </div>
              {itemCount > 0 && (
                <span className="bg-orange-600 text-white text-xs rounded-full px-2 py-1">
                  {itemCount} items
                </span>
              )}
            </Link>

            <hr className="my-2" />
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  {user?.profile_pic?.url ? (
                    <img
                      src={user.profile_pic.url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-lg">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <span>👤</span>
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <span>📦</span>
                  <span>My Orders</span>
                </Link>

                {user?.role === "restaurant_owner" && (
                  <Link
                    to="/owner/restaurants"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <span>🏪</span>
                    <span>My Restaurants</span>
                  </Link>
                )}

                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <span>⚙️</span>
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-orange-600 border border-orange-600 hover:bg-orange-50"
                >
                  <span>🔐</span>
                  <span className="font-medium">Sign In</span>
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  <span>📝</span>
                  <span className="font-medium">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;
