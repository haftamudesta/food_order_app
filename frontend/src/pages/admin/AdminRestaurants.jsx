import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getRestaurants,
  toggleRestaurantStatus,
  deleteRestaurant,
} from "../../redux/actions/restaurantAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  BuildingStorefrontIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const AdminRestaurants = () => {
  const dispatch = useDispatch();
  const { restaurants, loading, total } = useSelector(
    (state) => state.restaurants,
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getRestaurants({ keyword: searchTerm }));
  }, [dispatch, searchTerm]);

  const handleToggleStatus = async (id, currentStatus) => {
    if (
      window.confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this restaurant?`,
      )
    ) {
      await dispatch(toggleRestaurantStatus(id));
      dispatch(getRestaurants({ keyword: searchTerm }));
    }
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      await dispatch(deleteRestaurant(id));
      dispatch(getRestaurants({ keyword: searchTerm }));
    }
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
              Manage Restaurants
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage all restaurants
            </p>
          </div>
          <Link
            to="/owner/restaurants/create"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Add Restaurant
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuisine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurants?.map((restaurant) => (
                  <tr key={restaurant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {restaurant.images?.[0]?.url ? (
                          <img
                            src={restaurant.images[0].url}
                            alt={restaurant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-5 h-5 text-orange-600" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {restaurant.address?.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.owner?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.cuisine?.join(", ") || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm text-gray-900">
                          {restaurant.rating?.average || "New"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          restaurant.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {restaurant.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/restaurant/${restaurant.slug || restaurant._id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
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
                          className="text-yellow-600 hover:text-yellow-800"
                          title={
                            restaurant.isActive ? "Deactivate" : "Activate"
                          }
                        >
                          <ClockIcon className="w-5 h-5" />
                        </button>
                        <Link
                          to={`/owner/restaurants/${restaurant._id}/edit`}
                          className="text-orange-600 hover:text-orange-800"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(restaurant._id, restaurant.name)
                          }
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {restaurants?.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No restaurants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurants;
