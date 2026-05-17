import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

const RestaurantCard = ({ restaurant, onEdit, onDelete, isDeleting }) => {
  const { user } = useSelector((state) => state.user);

  const canModify = () => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "restaurant_owner" && restaurant.owner?._id === user._id)
      return true;
    return false;
  };

  const getPriceSymbol = (cost) => {
    if (!cost) return "$$";
    if (cost < 15) return "$";
    if (cost < 30) return "$$";
    if (cost < 50) return "$$$";
    return "$$$$";
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Link
        to={`/restaurant/${restaurant._id}`}
        className="block relative h-48 overflow-hidden"
      >
        {restaurant.images && restaurant.images.length > 0 ? (
          <img
            src={restaurant.images[0].url}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <span className="text-white text-lg font-bold">No Image</span>
          </div>
        )}

        {restaurant.rating?.average > 0 && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-800">
              {restaurant.rating.average.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({restaurant.rating.count || 0})
            </span>
          </div>
        )}

        {restaurant.isVeg && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Pure Veg
          </div>
        )}
      </Link>

      <div className="p-4 flex-1">
        <Link to={`/restaurant/${restaurant._id}`}>
          <h3 className="text-lg font-bold text-gray-800 hover:text-orange-600 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {restaurant.description || "No description available"}
        </p>

        <div className="mt-3 space-y-2">
          {restaurant.cuisine && restaurant.cuisine.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.cuisine.slice(0, 3).map((cuisine, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {cuisine}
                </span>
              ))}
              {restaurant.cuisine.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  +{restaurant.cuisine.length - 3}
                </span>
              )}
            </div>
          )}
          {restaurant.address?.city && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4" />
              <span>{restaurant.address.city}</span>
            </div>
          )}

          {restaurant.pricing?.averageCost && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span>{getPriceSymbol(restaurant.pricing.averageCost)}</span>
              <span className="text-xs text-gray-400">
                avg ${restaurant.pricing.averageCost} for two
              </span>
            </div>
          )}
        </div>
      </div>
      {canModify() && (
        <div className="border-t border-gray-100 p-3 flex gap-2 bg-gray-50">
          <button
            onClick={() => onEdit(restaurant._id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(restaurant._id, restaurant.name)}
            disabled={isDeleting === restaurant._id}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting === restaurant._id ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantCard;
