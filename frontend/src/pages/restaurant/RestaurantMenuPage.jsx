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
    foodItems,
    loading: foodLoading,
    total,
  } = useSelector((state) => state.food);

  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [sortBy, setSortBy] = useState("-orderCount");

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
    priceRange,
    showOnlyAvailable,
    sortBy,
  ]);

  const fetchFoodItems = () => {
    dispatch(
      getAllFoodItems({
        restaurantId: id,
        isAvailable: showOnlyAvailable,
        sortBy: sortBy,
      }),
    );
  };

  const filterAndSortItems = () => {
    let items = [...foodItems];

    // Filter by availability
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

  useEffect(() => {
    if (foodItems.length > 0) {
      const uniqueCategories = [
        ...new Set(foodItems.map((item) => item.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    }
  }, [foodItems]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
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
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative h-75 md:h-87.5">
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="absolute top-4 left-4">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Restaurants</span>
          </Link>
        </div>

        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          {isFavorite ? (
            <HeartIcon className="w-6 h-6 text-red-500" />
          ) : (
            <HeartOutlineIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {restaurant.rating?.average > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>{restaurant.rating.average.toFixed(1)}</span>
                  <span className="text-gray-300">
                    ({restaurant.rating.count} reviews)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                <span>
                  {restaurant.address?.city}, {restaurant.address?.state}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>Open • Closes at 10:00 PM</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-200 max-w-2xl">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <RestaurantInfoCard title="Restaurant Info">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Cuisine:</strong> {restaurant.cuisine?.join(", ")}
                  </p>
                  <p>
                    <strong>Address:</strong> {restaurant.address?.street}
                  </p>
                  <p>
                    <strong>Phone:</strong> {restaurant.contact?.phone}
                  </p>
                  {restaurant.pricing?.averageCost && (
                    <p>
                      <strong>Avg. Cost:</strong> $
                      {restaurant.pricing.averageCost} per person
                    </p>
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
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showOnlyAvailable}
                        onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                        className="w-4 h-4 text-orange-600 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Show only available items
                      </span>
                    </label>
                  </div>

                  {(selectedCategory ||
                    priceRange.min ||
                    priceRange.max ||
                    !showOnlyAvailable) && (
                    <button
                      onClick={clearFilters}
                      className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </RestaurantInfoCard>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === "all"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => setActiveTab("popular")}
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
                    onClick={() => setActiveTab("discounted")}
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
                    onClick={() => setActiveTab("new")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === "new"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    New Arrivals
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="-orderCount">Most Popular</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-createdAt">Newest First</option>
                </select>
              </div>
            </div>

            {foodLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No food items found</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredItems.length} items
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <FoodItemCard key={item._id} foodItem={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenuPage;
