import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getRestaurantById,
  clearSelectedRestaurant,
  getRestaurantStats,
} from "../../redux/slices/restaurantSlice";
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ClockIcon,
  WifiIcon,
  TruckIcon,
  ClipboardDocumentIcon,
  BuildingOfficeIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import MenuSection from "./MenuSection";
import ReviewSection from "./ReviewSection";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorAlert from "../../components/ui/ErrorAlert";
import RestaurantInfoCard from "./RestaurantInfoCard";
import OperatingHours from "../components/restaurant/OperatingHours";

const SpoonIcon = () => (
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
      d="M3 3l7.5 7.5M21 3l-7.5 7.5M3 21l7.5-7.5M21 21l-7.5-7.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 12v6m0-6h6m-6 0H6"
    />
  </svg>
);

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedRestaurant: restaurant,
    loading,
    error,
  } = useSelector((state) => state.restaurants);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("menu");
  const [isOpen, setIsOpen] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    dispatch(getRestaurantById(id));
    dispatch(getRestaurantStats(id));

    return () => {
      dispatch(clearSelectedRestaurant());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (restaurant) {
      checkIfOpen();
    }
  }, [restaurant]);

  const checkIfOpen = async () => {
    try {
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
      if (hours?.isClosed) {
        setIsOpen(false);
      } else if (hours?.open && hours?.close) {
        setIsOpen(currentTime >= hours.open && currentTime <= hours.close);
      } else {
        setIsOpen(null);
      }
    } catch (error) {
      setIsOpen(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorAlert
          message={error || "Restaurant not found"}
          onRetry={() => dispatch(getRestaurantById(id))}
        />
      </div>
    );
  }

  const primaryImage =
    restaurant.images?.find((img) => img.isPrimary) || restaurant.images?.[0];
  const backgroundImage = primaryImage?.url || "/images/restaurant-hero.jpg";

  const amenityIcons = {
    WiFi: <WifiIcon className="w-5 h-5" />,
    Parking: <BuildingOfficeIcon className="w-5 h-5" />,
    Delivery: <TruckIcon className="w-5 h-5" />,
    Takeout: <ClipboardDocumentIcon className="w-5 h-5" />,
    "Vegetarian Options": <SpoonIcon />,
    "Vegan Options": <SpoonIcon />,
    "Gluten-Free Options": <SpoonIcon />,
    "Wheelchair Accessible": <BuildingOfficeIcon className="w-5 h-5" />,
    "Outdoor Seating": <SpoonIcon />,
    Bar: <SpoonIcon />,
    Reservations: <ClipboardDocumentIcon className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-100 md:h-125">
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <div className="container mx-auto max-w-7xl">
            {restaurant.isVerified && (
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-500 rounded-full p-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold">
                  Verified Restaurant
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {restaurant.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {restaurant.rating?.average > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-green-600 px-2 py-1 rounded-lg">
                    <span className="font-bold">
                      {restaurant.rating.average.toFixed(1)}
                    </span>
                    <StarIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">
                    ({restaurant.rating.count}{" "}
                    {restaurant.rating.count === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                <span className="text-sm">
                  {restaurant.fullAddress || restaurant.address?.street}
                </span>
              </div>

              {isOpen !== null && (
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    isOpen ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full bg-white`} />
                  {isOpen ? "Open Now" : "Closed"}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {restaurant.cuisine?.map((type, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-6 right-6 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          {isFavorite ? (
            <HeartIcon className="w-6 h-6 text-red-500" />
          ) : (
            <HeartOutlineIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Menu and Reviews */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab("menu")}
                  className={`pb-4 px-1 font-medium transition-colors relative ${
                    activeTab === "menu"
                      ? "text-orange-600 border-b-2 border-orange-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Menu
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-4 px-1 font-medium transition-colors relative ${
                    activeTab === "reviews"
                      ? "text-orange-600 border-b-2 border-orange-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Reviews ({restaurant.reviews?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("photos")}
                  className={`pb-4 px-1 font-medium transition-colors relative ${
                    activeTab === "photos"
                      ? "text-orange-600 border-b-2 border-orange-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Photos ({restaurant.images?.length || 0})
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === "menu" && (
                <MenuSection restaurantId={restaurant._id} />
              )}
              {activeTab === "reviews" && (
                <ReviewSection
                  restaurantId={restaurant._id}
                  reviews={restaurant.reviews}
                  canReview={user && restaurant.owner !== user.id}
                />
              )}
              {activeTab === "photos" && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {restaurant.images?.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <img
                        src={image.url}
                        alt={image.caption || `${restaurant.name} ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <RestaurantInfoCard title="Contact Information">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <a
                      href={`tel:${restaurant.contact?.phone}`}
                      className="text-gray-700 hover:text-orange-600"
                    >
                      {restaurant.contact?.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <a
                      href={`mailto:${restaurant.contact?.email}`}
                      className="text-gray-700 hover:text-orange-600"
                    >
                      {restaurant.contact?.email}
                    </a>
                  </div>
                  {restaurant.contact?.website && (
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                      <a
                        href={restaurant.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-orange-600"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </RestaurantInfoCard>

              <RestaurantInfoCard title="Operating Hours">
                <OperatingHours hours={restaurant.operatingHours} />
              </RestaurantInfoCard>

              {restaurant.amenities?.length > 0 && (
                <RestaurantInfoCard title="Amenities">
                  <div className="flex flex-wrap gap-2">
                    {restaurant.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm"
                      >
                        {amenityIcons[amenity] || <SpoonIcon />}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </RestaurantInfoCard>
              )}

              {restaurant.pricing?.averageCost && (
                <RestaurantInfoCard title="Price Range">
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-gray-900">
                      ${restaurant.pricing.averageCost}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Average cost per person
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Currency: {restaurant.pricing.currency || "USD"}
                    </div>
                  </div>
                </RestaurantInfoCard>
              )}

              <div className="space-y-3">
                <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                  Make a Reservation
                </button>
                <button className="w-full border-2 border-orange-600 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                  Order Online
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
