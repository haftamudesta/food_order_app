import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  FunnelIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorAlert from "../../components/ui/ErrorAlert";
import RestaurantCard from "@/shared/components/cards/RestaurantCard";
import { getRestaurants } from "../../redux/actions/restaurantAction";
import {
  sortByRating,
  sortByReview,
  toggleVegOnly,
  clearError,
} from "../../redux/slices/restaurantSlice";

const RestaurantsPage = () => {
  const dispatch = useDispatch();
  const {
    restaurants = [],
    count,
    loading,
    error,
    showVegOnly,
    pureVegRestaurantCount,
  } = useSelector((state) => state.restaurants || { restaurants: [] });

  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const allCuisines =
    restaurants && restaurants.length > 0
      ? [...new Set(restaurants.flatMap((r) => r.cuisine || []))]
      : [];

  const allCities =
    restaurants && restaurants.length > 0
      ? [...new Set(restaurants.map((r) => r.address?.city).filter(Boolean))]
      : [];

  useEffect(() => {
    dispatch(getRestaurants(searchKeyword));
  }, [dispatch, searchKeyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getRestaurants(searchKeyword));
  };

  const handleSortByRating = () => {
    dispatch(sortByRating());
  };

  const handleSortByReview = () => {
    dispatch(sortByReview());
  };

  const handleToggleVegOnly = () => {
    dispatch(toggleVegOnly());
  };

  const clearFilters = () => {
    setSelectedCuisine("");
    setSelectedCity("");
    setPriceRange("");
    setSearchKeyword("");
    dispatch(getRestaurants(""));
  };

  let filteredRestaurants =
    restaurants && restaurants.length > 0 ? [...restaurants] : [];

  if (showVegOnly && filteredRestaurants.length > 0) {
    filteredRestaurants = filteredRestaurants.filter((r) => r.isVeg);
  }

  if (selectedCuisine && filteredRestaurants.length > 0) {
    filteredRestaurants = filteredRestaurants.filter((r) =>
      r.cuisine?.includes(selectedCuisine),
    );
  }

  if (selectedCity && filteredRestaurants.length > 0) {
    filteredRestaurants = filteredRestaurants.filter(
      (r) => r.address?.city === selectedCity,
    );
  }

  if (priceRange && filteredRestaurants.length > 0) {
    filteredRestaurants = filteredRestaurants.filter((r) => {
      const cost = r.pricing?.averageCost;
      if (priceRange === "$") return cost < 15;
      if (priceRange === "$$") return cost >= 15 && cost < 30;
      if (priceRange === "$$$") return cost >= 30 && cost < 50;
      if (priceRange === "$$$$") return cost >= 50;
      return true;
    });
  }

  const hasActiveFilters =
    selectedCuisine || selectedCity || priceRange || showVegOnly;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert
          message={error}
          onRetry={() => {
            dispatch(clearError());
            dispatch(getRestaurants(searchKeyword));
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-r from-emerald-300 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Discover Amazing Restaurants
          </h1>
          <p className="text-center text-orange-100 mb-8">
            Find the best dining spots around you
          </p>
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by restaurant name, cuisine, or location..."
                className="flex-1 px-6 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-orange-600 text-white text-xs rounded-full px-2 py-0.5">
                  {showVegOnly ? 1 : 0}
                </span>
              )}
            </button>

            <button
              onClick={handleSortByRating}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <StarIcon className="w-5 h-5" />
              <span>Top Rated</span>
            </button>

            <button
              onClick={handleSortByReview}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Most Reviewed</span>
            </button>
          </div>

          <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
            Found {filteredRestaurants.length}{" "}
            {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"}
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  disabled={allCuisines.length === 0}
                >
                  <option value="">All Cuisines</option>
                  {allCuisines.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  disabled={allCities.length === 0}
                >
                  <option value="">All Cities</option>
                  {allCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Prices</option>
                  <option value="$">$ (Under $15)</option>
                  <option value="$$">$$ ($15 - $30)</option>
                  <option value="$$$">$$$ ($30 - $50)</option>
                  <option value="$$$$">$$$$ ($50+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preference
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showVegOnly}
                    onChange={handleToggleVegOnly}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    Pure Vegetarian Only
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No restaurants found</p>
            <p className="text-gray-400 mt-2">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
