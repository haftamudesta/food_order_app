import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { StarIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import { incrementOrderCount } from "@/redux/actions/foodActions";

const FoodItemCard = ({ item }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const primaryImage =
    item.images?.find((img) => img.isPrimary) || item.images?.[0];
  const displayImage = primaryImage?.url || "/images/food-placeholder.jpg";
  const isDiscounted = item.isDiscountActive;
  const currentPrice = isDiscounted ? item.discountedPrice : item.price;
  const discountPercent = item.discount;
  const handleAddToCart = () => {
    console.log(`Added ${quantity} x ${item.name} to cart`);
    dispatch(incrementOrderCount({ id: item._id, quantity }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
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
          </div>
          <div className="flex items-center justify-end gap-3 mt-3">
            {quantity > 0 && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-gray-200 rounded-l-lg transition-colors"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:bg-gray-200 rounded-r-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                item.isAvailable
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {addedToCart
                ? "Added!"
                : item.isAvailable
                  ? "Add to Cart"
                  : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;
