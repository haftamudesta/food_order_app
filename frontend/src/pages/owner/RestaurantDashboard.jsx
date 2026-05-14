import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyRestaurants,
  toggleRestaurantStatus,
  deleteRestaurant,
} from "../../redux/actions/restaurantAction";
import { getRestaurantStats } from "../../redux/actions/restaurantAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  BuildingStorefrontIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const RestaurantDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myRestaurants, loading, error, success } = useSelector(
    (state) => state.restaurants,
  );
  const { user } = useSelector((state) => state.user);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (user && (user.role === "restaurant_owner" || user.role === "admin")) {
      dispatch(getMyRestaurants());
    } else {
      navigate("/");
    }
  }, [dispatch, user, navigate]);

  const handleToggleStatus = async (id, currentStatus) => {
    if (
      window.confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this restaurant?`,
      )
    ) {
      await dispatch(toggleRestaurantStatus(id));
      dispatch(getMyRestaurants());
    }
  };

  const handleDeleteRestaurant = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      await dispatch(deleteRestaurant(id));
      dispatch(getMyRestaurants());
    }
  };

  const handleViewStats = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowStats(true);
    setStatsLoading(true);
    try {
      const result = await dispatch(
        getRestaurantStats(restaurant._id),
      ).unwrap();
      setStats(result);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const closeStats = () => {
    setShowStats(false);
    setSelectedRestaurant(null);
    setStats(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Restaurant Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your restaurants and track performance
            </p>
          </div>
          <Link
            to="/owner/restaurants/create"
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Restaurant
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myRestaurants?.length || 0}
                </p>
              </div>
              <BuildingStorefrontIcon className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Restaurants</p>
                <p className="text-2xl font-bold text-green-600">
                  {myRestaurants?.filter((r) => r.isActive).length || 0}
                </p>
              </div>
              <ClockIcon className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {calculateAverageRating(myRestaurants)}
                </p>
              </div>
              <StarIcon className="w-10 h-10 text-yellow-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${calculateTotalRevenue(myRestaurants).toFixed(2)}
                </p>
              </div>
              <CurrencyDollarIcon className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              My Restaurants
            </h2>
          </div>

          {myRestaurants?.length === 0 ? (
            <div className="text-center py-12">
              <BuildingStorefrontIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No restaurants found</p>
              <Link
                to="/owner/restaurants/create"
                className="inline-block mt-4 text-orange-600 hover:text-orange-700"
              >
                Create your first restaurant
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myRestaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {restaurant.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            restaurant.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {restaurant.isActive ? "Active" : "Inactive"}
                        </span>
                        {restaurant.isVerified && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Cuisine</p>
                          <p className="text-gray-900">
                            {restaurant.cuisine?.join(", ") || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rating</p>
                          <p className="text-gray-900 flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            {restaurant.rating?.average ||
                              restaurant.rating ||
                              "New"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg. Cost</p>
                          <p className="text-gray-900">
                            ${restaurant.pricing?.averageCost || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Orders</p>
                          <p className="text-gray-900">
                            {restaurant.totalOrders || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleViewStats(restaurant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Statistics"
                      >
                        <ChartBarIcon className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/owner/restaurants/${restaurant._id}/edit`}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Restaurant"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/restaurant/${restaurant.slug || restaurant._id}`}
                        target="_blank"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Public Page"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            restaurant._id,
                            restaurant.isActive,
                          )
                        }
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title={restaurant.isActive ? "Deactivate" : "Activate"}
                      >
                        <ClockIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteRestaurant(
                            restaurant._id,
                            restaurant.name,
                          )
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Restaurant"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showStats && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedRestaurant.name} - Statistics
              </h2>
              <button
                onClick={closeStats}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {statsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="large" />
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.averageRating?.toFixed(1) || "N/A"} / 5
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Reviews</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.totalReviews || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Menu Items</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.totalMenuItems || 0}
                      </p>
                    </div>
                  </div>

                  {stats.ratingDistribution && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Rating Distribution
                      </h3>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-12 text-sm text-gray-600">
                              {star} ★
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-500 rounded-full"
                                style={{
                                  width: `${(stats.ratingDistribution[star] / stats.totalReviews) * 100 || 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                              {stats.ratingDistribution[star] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.menuStats && stats.menuStats.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Menu by Category
                      </h3>
                      <div className="space-y-3">
                        {stats.menuStats.map((category) => (
                          <div
                            key={category._id}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {category._id}
                              </p>
                              <p className="text-sm text-gray-500">
                                {category.count} items
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900">
                                ${category.avgPrice?.toFixed(2)} avg
                              </p>
                              <p className="text-xs text-gray-500">
                                ${category.minPrice} - ${category.maxPrice}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No statistics available
                </p>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeStats}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const calculateAverageRating = (restaurants) => {
  if (!restaurants || restaurants.length === 0) return "N/A";
  const total = restaurants.reduce(
    (sum, r) => sum + (r.rating?.average || r.rating || 0),
    0,
  );
  return (total / restaurants.length).toFixed(1);
};

const calculateTotalRevenue = (restaurants) => {
  if (!restaurants || restaurants.length === 0) return 0;
  return restaurants.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
};

export default RestaurantDashboard;
