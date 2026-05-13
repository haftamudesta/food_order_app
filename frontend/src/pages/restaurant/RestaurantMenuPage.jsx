import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurantById } from "../../redux/actions/restaurantAction";
import { clearSelectedRestaurant } from "../../redux/slices/restaurantSlice";
import { getAllFoodItems } from "../../redux/actions/foodActions";
import {
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  FireIcon,
  TagIcon,
  HeartIcon,
  XMarkIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorAlert from "../../components/ui/ErrorAlert";
import FoodItemCard from "@/shared/components/cards/FoodCard";
import RestaurantInfoCard from "./RestaurantInfoCard";

const RestaurantMenuPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedRestaurant: restaurant, loading: restaurantLoading } =
    useSelector((state) => state.restaurants);
  const {
    foodItems = [],
    loading: foodLoading,
    total = 0,
  } = useSelector((state) => state.food);

  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [sortBy, setSortBy] = useState("-orderCount");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getRestaurantById(id));
      fetchFoodItems();
    }

    return () => {
      dispatch(clearSelectedRestaurant());
    };
  }, [dispatch, id]);

  useEffect(() => {
    filterAndSortItems();
  }, [
    foodItems,
    activeTab,
    selectedCategory,
    priceRange.min,
    priceRange.max,
    showOnlyAvailable,
    sortBy,
  ]);

  useEffect(() => {
    if (foodItems && foodItems.length > 0) {
      const uniqueCategories = [
        ...new Set(foodItems.map((item) => item.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    }
  }, [foodItems]);

  const fetchFoodItems = () => {
    const filters = {
      restaurantId: id,
      sortBy: sortBy,
    };

    if (showOnlyAvailable) {
      filters.isAvailable = true;
    }

    if (selectedCategory) {
      filters.category = selectedCategory;
    }

    if (priceRange.min) {
      filters.minPrice = priceRange.min;
    }

    if (priceRange.max) {
      filters.maxPrice = priceRange.max;
    }

    dispatch(getAllFoodItems(filters));
  };

  const filterAndSortItems = () => {
    if (!foodItems || foodItems.length === 0) {
      setFilteredItems([]);
      return;
    }

    let items = [...foodItems];

    if (showOnlyAvailable) {
      items = items.filter((item) => item.isAvailable);
    }

    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (priceRange.min) {
      items = items.filter((item) => item.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      items = items.filter((item) => item.price <= parseFloat(priceRange.max));
    }

    if (activeTab === "popular") {
      items = items.filter((item) => item.isPopular || item.orderCount > 5);
    } else if (activeTab === "discounted") {
      items = items.filter((item) => item.isDiscountActive);
    } else if (activeTab === "new") {
      items = items.filter((item) => item.isNewOne);
    }

    if (sortBy === "-price") {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === "price") {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === "-orderCount") {
      items.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
    } else if (sortBy === "-createdAt") {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredItems(items);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    fetchFoodItems();
  };

  const handlePriceRangeChange = (type, value) => {
    setPriceRange((prev) => ({ ...prev, [type]: value }));
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setShowOnlyAvailable(true);
    setActiveTab("all");
    setSortBy("-orderCount");
    setShowFilters(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
  };

  const hasActiveFilters =
    selectedCategory ||
    priceRange.min ||
    priceRange.max ||
    !showOnlyAvailable ||
    activeTab !== "all";

  if (restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorAlert
          message="Restaurant not found"
          onRetry={() => navigate("/restaurants")}
        />
      </div>
    );
  }

  const primaryImage =
    restaurant.images?.find((img) => img.isPrimary) || restaurant.images?.[0];
  const backgroundImage = primaryImage?.url || "/images/restaurant-hero.jpg";

  const getIsOpen = () => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = days[new Date().getDay()];
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const hours = restaurant.operatingHours?.[currentDay];
    if (!hours || hours.isClosed) return false;
    if (hours.open && hours.close) {
      return currentTime >= hours.open && currentTime <= hours.close;
    }
    return true;
  };

  const isOpen = getIsOpen();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 md:h-80 lg:h-96">
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        <div className="absolute top-24 left-12 z-10 bg-red-600">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-red-500 px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-md"
          >
            <ArrowLeftIcon className="w-5 h-5 " />
            <span>Back to Restaurants</span>
          </Link>
        </div>

        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          {isFavorite ? (
            <HeartIcon className="w-6 h-6 text-red-500" />
          ) : (
            <HeartOutlineIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
              {restaurant.rating?.average > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">
                    {restaurant.rating.average.toFixed(1)}
                  </span>
                  <span className="text-gray-300">
                    ({restaurant.rating.count}{" "}
                    {restaurant.rating.count === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-5 h-5" />
                <span>
                  {restaurant.address?.city}, {restaurant.address?.state}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-5 h-5" />
                <span className={isOpen ? "text-green-400" : "text-red-400"}>
                  {isOpen ? "Open Now" : "Closed"}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-200 max-w-2xl line-clamp-2">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <RestaurantInfoCard title="Restaurant Info">
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-gray-700">Cuisine:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {restaurant.cuisine?.slice(0, 3).map((type, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {type}
                        </span>
                      ))}
                      {restaurant.cuisine?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{restaurant.cuisine.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <strong className="text-gray-700">Address:</strong>
                    <p className="text-gray-600 mt-1">
                      {restaurant.address?.street}
                    </p>
                    <p className="text-gray-600">
                      {restaurant.address?.city}, {restaurant.address?.state}{" "}
                      {restaurant.address?.zipCode}
                    </p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Phone:</strong>
                    <p className="text-gray-600 mt-1">
                      {restaurant.contact?.phone}
                    </p>
                  </div>
                  {restaurant.pricing?.averageCost && (
                    <div>
                      <strong className="text-gray-700">Avg. Cost:</strong>
                      <p className="text-gray-600 mt-1">
                        ${restaurant.pricing.averageCost} per person
                      </p>
                    </div>
                  )}
                </div>
              </RestaurantInfoCard>

              <RestaurantInfoCard title="Filters">
                <div className="space-y-4">
                  {categories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min $"
                        value={priceRange.min}
                        onChange={(e) =>
                          handlePriceRangeChange("min", e.target.value)
                        }
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                      <input
                        type="number"
                        placeholder="Max $"
                        value={priceRange.max}
                        onChange={(e) =>
                          handlePriceRangeChange("max", e.target.value)
                        }
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyAvailable}
                        onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">
                        Show only available items
                      </span>
                    </label>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              </RestaurantInfoCard>
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center justify-center gap-2 shadow-sm"
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
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Filters & Sort
                {hasActiveFilters && (
                  <span className="bg-orange-600 text-white text-xs rounded-full px-2 py-0.5">
                    Active
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="lg:hidden mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {categories.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        handlePriceRangeChange("min", e.target.value)
                      }
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        handlePriceRangeChange("max", e.target.value)
                      }
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlyAvailable}
                      onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span className="text-sm">Show only available items</span>
                  </label>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setShowFilters(false);
                    }}
                    className="w-full text-sm text-orange-600 font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-1 border-b border-gray-200">
                  <button
                    onClick={() => handleTabChange("all")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === "all"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => handleTabChange("popular")}
                    className={`px-4 py-2 font-medium transition-colors flex items-center gap-1 ${
                      activeTab === "popular"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FireIcon className="w-4 h-4" />
                    Popular
                  </button>
                  <button
                    onClick={() => handleTabChange("discounted")}
                    className={`px-4 py-2 font-medium transition-colors flex items-center gap-1 ${
                      activeTab === "discounted"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <TagIcon className="w-4 h-4" />
                    Discounted
                  </button>
                  <button
                    onClick={() => handleTabChange("new")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === "new"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    New Arrivals
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    <option value="-orderCount">Most Popular</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-createdAt">Newest First</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
              {total > 0 && ` out of ${total} total`}
            </div>

            {foodLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-500 text-lg">No food items found</p>
                <p className="text-gray-400 mt-2">
                  Try adjusting your filters or check back later
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
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <FoodItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenuPage;
