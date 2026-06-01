import { useEffect, useState, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/actions/userAction";
import { getCart } from "../../../redux/actions/cartAction";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  const { isAuthenticated, user, loading } = useSelector((state) => state.user);
  const { itemCount = 0, items = [] } = useSelector(
    (state) => state.cart || { itemCount: 0, items: [] },
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        dispatch(getCart());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideMenu =
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target);
      const isOutsideButton =
        menuButtonRef.current && !menuButtonRef.current.contains(event.target);

      if (isMobileMenuOpen && isOutsideMenu && isOutsideButton) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsideButton =
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target);

      if (isDropdownOpen && isOutsideDropdown && isOutsideButton) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await dispatch(logout());
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    navigate("/sign-in");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    {
      to: "/restaurants",
      label: "Restaurants",
    },
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

  const showDashboard =
    user && (user.role === "restaurant_owner" || user.role === "admin");
  const isAdmin = user?.role === "admin";
  const isRestaurantOwner = user?.role === "restaurant_owner";

  if (loading) {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-lg`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold"
            >
              <span className="text-orange-600">Food</span>
              <span className="text-gray-700">Delivery</span>
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${
            isScrolled
              ? "bg-white shadow-lg"
              : "bg-gradient-to-r from-orange-600 to-orange-700"
          }
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3 md:py-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold transition-transform hover:scale-105 z-50"
              onClick={closeMobileMenu}
            >
              <span className={isScrolled ? "text-orange-600" : "text-white"}>
                Food
              </span>
              <span className={isScrolled ? "text-gray-700" : "text-white"}>
                Delivery
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                return (
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
                );
              })}
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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    ref={dropdownButtonRef}
                    onClick={toggleDropdown}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                      ${
                        isScrolled
                          ? "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                          : "text-white hover:bg-white/10"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                        ${isScrolled ? "bg-orange-100 text-orange-600" : "bg-white/20 text-white"}
                      `}
                    >
                      {getInitials(user?.name)}
                    </div>
                    <span className="hidden lg:inline">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    ref={dropdownRef}
                    className={`
                      absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50
                      transition-all duration-300 ease-out origin-top-right
                      ${
                        isDropdownOpen
                          ? "opacity-100 scale-100 translate-x-0"
                          : "opacity-0 scale-95 translate-x-4 pointer-events-none"
                      }
                    `}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={closeDropdown}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={closeDropdown}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                      <span>My Orders</span>
                    </Link>

                    {showDashboard && (
                      <Link
                        to={isAdmin ? "/admin/dashboard" : "/owner/dashboard"}
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <ChartBarIcon className="w-5 h-5" />
                        <span>
                          {isAdmin ? "Admin Dashboard" : "Restaurant Dashboard"}
                        </span>
                      </Link>
                    )}

                    {isRestaurantOwner && (
                      <Link
                        to="/owner/restaurants"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <BuildingStorefrontIcon className="w-5 h-5" />
                        <span>My Restaurants</span>
                      </Link>
                    )}

                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link
                          to="/admin/restaurants"
                          onClick={closeDropdown}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <BuildingStorefrontIcon className="w-5 h-5" />
                          <span>Manage Restaurants</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
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
              ref={menuButtonRef}
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg transition-colors z-50 relative bg-transparent"
              aria-label="Toggle menu"
              type="button"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon
                  className={`w-6 h-6 ${isScrolled ? "text-gray-700" : "text-white"}`}
                />
              ) : (
                <Bars3Icon
                  className={`w-6 h-6 ${isScrolled ? "text-gray-700" : "text-white"}`}
                />
              )}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ top: "60px" }}>
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          />
          <div
            ref={mobileMenuRef}
            className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto"
            style={{ zIndex: 45 }}
          >
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => {
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
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
                );
              })}

              <div className="border-t border-gray-200 my-2" />

              <Link
                to="/cart"
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span className="font-medium">Cart</span>
                </div>
                {itemCount > 0 && (
                  <span className="bg-orange-600 text-white text-xs rounded-full px-2 py-1 font-semibold">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                )}
              </Link>

              <div className="border-t border-gray-200 my-2" />

              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-lg">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/orders"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <ClipboardDocumentListIcon className="w-5 h-5" />
                    <span>My Orders</span>
                  </Link>

                  {showDashboard && (
                    <Link
                      to={isAdmin ? "/admin/dashboard" : "/owner/dashboard"}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <ChartBarIcon className="w-5 h-5" />
                      <span>
                        {isAdmin ? "Admin Dashboard" : "Restaurant Dashboard"}
                      </span>
                    </Link>
                  )}

                  {isRestaurantOwner && (
                    <Link
                      to="/owner/restaurants"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <BuildingStorefrontIcon className="w-5 h-5" />
                      <span>My Restaurants</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-orange-600 border border-orange-600 hover:bg-orange-50"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="font-medium">Sign Up</span>
                  </Link>
                </>
              )}
            </div>
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
        @keyframes slideFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        .animate-slideFromLeft {
          animation: slideFromLeft 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;
