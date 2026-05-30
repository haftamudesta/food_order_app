import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, clearCart } from "@/redux/actions/cartAction";
import { openCart } from "@/redux/slices/cartSlice";
import RestaurantSwitchModal from "../modals/RestaurantSwitchModal";
import toast from "react-hot-toast";
import {
  StarIcon,
  FireIcon,
  TagIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import axiosInstance from "@/lib/axios";

const FoodItemCard = ({ item }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [showInstructions, setShowInstructions] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiDescription, setAiDescription] = useState(item.description || "");
  const [showAiDescription, setShowAiDescription] = useState(false);

  const { restaurant: cartRestaurant, items: cartItems } = useSelector(
    (state) => state.cart,
  );
  const { isAuthenticated } = useSelector((state) => state.user);

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setQuantity((prev) => Math.min(prev + 1, 10));
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const isDifferentRestaurant =
    cartRestaurant &&
    cartRestaurant._id !== item.restaurant?._id &&
    cartRestaurant !== item.restaurant &&
    cartItems.length > 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    if (isDifferentRestaurant) {
      setShowModal(true);
      return;
    }

    await addItemToCart();
  };

  const addItemToCart = async () => {
    setIsAdding(true);
    const loadingToast = toast.loading("Adding to cart...");

    try {
      await dispatch(
        addToCart({
          foodItemId: item._id,
          quantity,
          specialInstructions,
        }),
      ).unwrap();

      toast.dismiss(loadingToast);
      toast.success(`${item.name} added to cart!`);
      dispatch(openCart());
      setQuantity(1);
      setSpecialInstructions("");
      setShowInstructions(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClearCartAndAdd = async () => {
    setShowModal(false);
    setIsAdding(true);
    const loadingToast = toast.loading("Clearing cart and adding item...");

    try {
      await dispatch(clearCart()).unwrap();

      await dispatch(
        addToCart({
          foodItemId: item._id,
          quantity,
          specialInstructions,
        }),
      ).unwrap();

      toast.dismiss(loadingToast);
      toast.success(`Cart cleared! ${item.name} added to cart!`);
      dispatch(openCart());
      setQuantity(1);
      setSpecialInstructions("");
      setShowInstructions(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to switch restaurants. Please try again.");
      console.error("Failed to clear cart and add:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const generateAIDescription = async () => {
    setIsGeneratingAI(true);
    const loadingToast = toast.loading(
      "AI is crafting a delicious description...",
    );

    try {
      const { data } = await axiosInstance.post(
        "/v1/food/generate-description",
        {
          name: item.name,
          category: item.category || "Main Course",
          spiceLevel: item.spiceLevel || "Medium",
          price: item.price,
        },
      );

      if (data.success && data.data) {
        setAiDescription(data.data.description);
        setShowAiDescription(true);
        toast.dismiss(loadingToast);
        toast.success("AI description generated!");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("AI generation failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate description",
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getDiscountedPrice = () => {
    if (item.isDiscountActive && item.discount) {
      const discountAmount = (item.price * item.discount.percentage) / 100;
      return item.price - discountAmount;
    }
    return item.price;
  };

  const hasDiscount = item.isDiscountActive && item.discount;
  const finalPrice = hasDiscount ? getDiscountedPrice() : item.price;
  const savedAmount = hasDiscount ? item.price - finalPrice : 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48 sm:h-auto">
            <img
              src={item.images?.[0]?.url || "/images/food-placeholder.jpg"}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {!item.isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold px-3 py-1 bg-red-600 rounded-full text-sm">
                  Unavailable
                </span>
              </div>
            )}
            {item.isPopular && (
              <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <FireIcon className="w-3 h-3" />
                Popular
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <TagIcon className="w-3 h-3" />
                {item.discount.percentage}% OFF
              </div>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {item.name}
                </h3>
                {item.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>
              {item.rating?.average > 0 && (
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {item.rating.average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Description with AI Generator */}
            <div className="mt-2">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                  {showAiDescription ? aiDescription : item.description}
                </p>
                <button
                  onClick={generateAIDescription}
                  disabled={isGeneratingAI}
                  className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                  title="Generate AI description"
                >
                  {isGeneratingAI ? (
                    <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SparklesIcon className="w-3 h-3" />
                  )}
                  <span>AI Describe</span>
                </button>
              </div>
              {showAiDescription && aiDescription !== item.description && (
                <button
                  onClick={() => setShowAiDescription(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                >
                  Show original description
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {item.dietaryInfo?.isVeg && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Vegetarian
                </span>
              )}
              {item.dietaryInfo?.isGlutenFree && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Gluten Free
                </span>
              )}
              {item.spiceLevel && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  Spice Level: {item.spiceLevel}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                {hasDiscount ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-orange-600">
                      ${finalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-green-600 font-semibold">
                      Save ${savedAmount.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-orange-600">
                    ${item.price.toFixed(2)}
                  </span>
                )}
              </div>

              {item.isAvailable ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={isAdding}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    disabled={isAdding}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || !item.isAvailable}
                    className="ml-2 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isAdding ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingBagIcon className="w-4 h-4" />
                    )}
                    Add to Cart
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                >
                  Unavailable
                </button>
              )}
            </div>

            {item.isAvailable && (
              <div className="mt-3">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-xs text-gray-500 hover:text-orange-600 transition-colors"
                >
                  {showInstructions ? "Hide" : "+ Add"} special instructions
                </button>
                {showInstructions && (
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Special requests (e.g., no onions, extra spicy, etc.)"
                    className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    rows="2"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <RestaurantSwitchModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleClearCartAndAdd}
        newRestaurantName={item.restaurant?.name || "this restaurant"}
        currentRestaurantName={cartRestaurant?.name || "another restaurant"}
        isLoading={isAdding}
      />
    </>
  );
};

export default FoodItemCard;
