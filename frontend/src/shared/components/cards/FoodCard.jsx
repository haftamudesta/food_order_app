import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon, MinusIcon, CheckIcon } from "@heroicons/react/24/solid";
import { incrementOrderCount } from "@/redux/actions/foodActions";
import { addToCart } from "../../redux/actions/cartAction";

const FoodItemCard = ({ item }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const primaryImage =
    item.images?.find((img) => img.isPrimary) || item.images?.[0];
  const displayImage = primaryImage?.url || "/images/food-placeholder.jpg";
  const isDiscounted = item.isDiscountActive;
  const currentPrice = isDiscounted ? item.discountedPrice : item.price;
  const discountPercent = item.discount;

  const handleAddToCart = async () => {
    if (!item.isAvailable) return;

    setIsUpdating(true);
    try {
      await dispatch(
        addToCart({
          foodItemId: item._id,
          quantity,
          specialInstructions: "",
        }),
      ).unwrap();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-3 p-3">
        <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={displayImage}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-orange-600">
                ${currentPrice?.toFixed(2)}
              </span>
              {isDiscounted && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ${item.price?.toFixed(2)}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            {item.servingSize && (
              <p className="text-xs text-gray-400 mt-1">{item.servingSize}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {item.isPopular && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            {item.isNewOne && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                New
              </span>
            )}
            {item.isRecommended && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Recommended
              </span>
            )}
            {item.orderCount > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {item.orderCount}+ orders
              </span>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 mt-3">
            {quantity > 0 && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-gray-200 rounded-l-lg transition-colors"
                  disabled={isUpdating}
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:bg-gray-200 rounded-r-lg transition-colors"
                  disabled={isUpdating}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable || isUpdating}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                item.isAvailable && !isUpdating
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : addedToCart ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Added!
                </>
              ) : item.isAvailable ? (
                "Add to Cart"
              ) : (
                "Out of Stock"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;
