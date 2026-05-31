import React from "react";
import { Link } from "react-router-dom";
import {
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import RestaurantReviewAnalysis from "../restaurant/RestaurantReviewAnalysis";

const RestaurantCard = ({ restaurant }) => {
  const { _id, name, description, cuisine, rating, images, pricing, address } =
    restaurant;

  const primaryImage = images?.find((img) => img.isPrimary) || images?.[0];
  const displayImage =
    primaryImage?.url || "/images/restaurant-placeholder.jpg";

  const renderStars = (averageRating) => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarOutlineIcon className="w-4 h-4 text-yellow-400" />
            <StarIcon className="w-4 h-4 text-yellow-400 absolute top-0 left-0 clip-half" />
          </div>,
        );
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="w-4 h-4 text-gray-300" />,
        );
      }
    }
    return stars;
  };

  const getPriceRange = (averageCost) => {
    if (!averageCost) return "N/A";
    if (averageCost < 15) return "$";
    if (averageCost < 30) return "$$";
    if (averageCost < 50) return "$$$";
    return "$$$$";
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Link
      to={`/restaurant/${_id}`}
      className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {restaurant.isVerified && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </div>
        )}
        {restaurant.isActive === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Temporarily Closed
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            {name}
          </h3>
          {rating?.average > 0 && (
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-full text-sm">
              <span className="font-semibold">{rating.average.toFixed(1)}</span>
              <StarIcon className="w-3 h-3" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {cuisine?.slice(0, 3).map((type, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {type}
            </span>
          ))}
          {cuisine?.length > 3 && (
            <span className="text-xs text-gray-500">+{cuisine.length - 3}</span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {truncateText(description)}
        </p>
        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {address?.street}, {address?.city}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span className="font-medium text-gray-700">
                {getPriceRange(pricing?.averageCost)}
              </span>
              {pricing?.averageCost && (
                <span className="text-xs">avg ${pricing.averageCost}</span>
              )}
            </div>

            {rating?.count > 0 && (
              <span className="text-xs">
                ({rating.count} {rating.count === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon className="w-3 h-3" />
            <span>Check hours</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              //  to be implemented favorites logic
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
