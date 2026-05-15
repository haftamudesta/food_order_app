import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getAllOrders,
  getOrderStatistics,
} from "../../redux/actions/orderAction";
import { getMyRestaurants } from "../../redux/actions/restaurantAction";
import { getAllUsers } from "../../redux/actions/userAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TruckIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const ClockIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const isMounted = useRef(true);
  const fetchCalled = useRef(false);

  // Safe selectors with fallbacks
  const orderState = useSelector((state) => state.order) || {};
  const restaurantState = useSelector((state) => state.restaurants) || {};
  const userState = useSelector((state) => state.user) || {};

  const {
    allOrders = [],
    statistics = {},
    loading: ordersLoading = false,
    totalOrders = 0,
    totalAmount = 0,
  } = orderState;

  const { myRestaurants = [], loading: restaurantsLoading = false } =
    restaurantState;

  const {
    user = null,
    users = [],
    totalUsers = 0,
    loading: usersLoading = false,
    error: usersError = null,
  } = userState;

  const isLoading = ordersLoading || restaurantsLoading || usersLoading;

  // Use a ref with a flag to ensure this runs only once even with Strict Mode
  useEffect(() => {
    if (fetchCalled.current === false) {
      fetchCalled.current = true;
      console.log("Fetching dashboard data - FIRST AND LAST TIME");

      // Execute all dispatches
      dispatch(getAllOrders());
      dispatch(getOrderStatistics());
      dispatch(getMyRestaurants());
      dispatch(getAllUsers());
    }

    return () => {
      isMounted.current = false;
    };
  }, [dispatch]); // Keep dispatch but the flag prevents re-execution

  // Show loading spinner
  if (isLoading && fetchCalled.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show error if there's a users error
  if (usersError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <XCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading Users
          </h2>
          <p className="text-red-600">{usersError}</p>
          <button
            onClick={() => dispatch(getAllUsers())}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Safe calculations with optional chaining
  const pendingOrders =
    allOrders?.filter((order) => order?.orderStatus === "pending").length || 0;
  const processingOrders =
    allOrders?.filter((order) => order?.orderStatus === "processing").length ||
    0;
  const deliveredOrders =
    allOrders?.filter((order) => order?.orderStatus === "delivered").length ||
    0;
  const cancelledOrders =
    allOrders?.filter((order) => order?.orderStatus === "cancelled").length ||
    0;

  const recentOrders = allOrders?.slice(0, 5) || [];

  // Safely calculate user statistics
  const activeUsers = users?.filter((u) => u?.isActive).length || 0;
  const adminUsers = users?.filter((u) => u?.role === "admin").length || 0;
  const restaurantOwners =
    users?.filter((u) => u?.role === "restaurant_owner").length || 0;
  const regularUsers = users?.filter((u) => u?.role === "user").length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.name || "Admin"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +{statistics?.totalOrders || 0} this month
                </p>
              </div>
              <ShoppingBagIcon className="w-12 h-12 text-orange-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(totalAmount || 0).toFixed(2)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +${(statistics?.totalRevenue || 0).toFixed(2)} this month
                </p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myRestaurants?.length || 0}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Active:{" "}
                  {myRestaurants?.filter((r) => r?.isActive).length || 0}
                </p>
              </div>
              <BuildingStorefrontIcon className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalUsers || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Active: {activeUsers}
                </p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {pendingOrders}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Processing</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {processingOrders}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {deliveredOrders}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{cancelledOrders}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600">Out for Delivery</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-indigo-600">
              {totalUsers || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Restaurant Owners</p>
            <p className="text-2xl font-bold text-blue-600">
              {restaurantOwners}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600">Admin Users</p>
            <p className="text-2xl font-bold text-purple-600">{adminUsers}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {order._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.restaurant?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.finalTotal?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.orderStatus === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.orderStatus === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : order.orderStatus === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/restaurants"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <BuildingStorefrontIcon className="w-10 h-10 text-orange-600" />
            <div>
              <h3 className="font-semibold text-gray-900">
                Manage Restaurants
              </h3>
              <p className="text-sm text-gray-500">
                Add, edit, or remove restaurants
              </p>
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <UserGroupIcon className="w-10 h-10 text-orange-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">
                View and manage user accounts
              </p>
            </div>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <ShoppingBagIcon className="w-10 h-10 text-orange-600" />
            <div>
              <h3 className="font-semibold text-gray-900">All Orders</h3>
              <p className="text-sm text-gray-500">
                View and manage all orders
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
