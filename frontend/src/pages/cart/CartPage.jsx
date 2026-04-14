import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from "../../redux/actions/cartAction";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorAlert from "../../components/ui/ErrorAlert";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items,
    restaurant,
    subtotal,
    tax,
    deliveryFee,
    discount,
    total,
    itemCount,
    couponCode,
    loading,
    error,
  } = useSelector((state) => state.cart);

  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
    await dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm("Remove this item from cart?")) {
      await dispatch(removeFromCart(itemId));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Clear entire cart?")) {
      await dispatch(clearCart());
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await dispatch(applyCoupon(couponInput));
    setCouponInput("");
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = async () => {
    await dispatch(removeCoupon());
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    if (restaurant?._id) {
      navigate(`/restaurant/${restaurant._id}`);
    } else {
      navigate("/restaurants");
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorAlert message={error} onRetry={() => dispatch(getCart())} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </h1>
                  {items.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Clear Cart
                    </button>
                  )}
                </div>
                {restaurant && (
                  <div className="mt-2 text-sm text-gray-600">
                    Ordering from:{" "}
                    <span className="font-semibold">{restaurant.name}</span>
                  </div>
                )}
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item._id} className="p-6 flex gap-4">
                    {/* Item Image */}
                    <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={
                          item.foodItem?.images?.[0]?.url ||
                          "/images/food-placeholder.jpg"
                        }
                        alt={item.foodItem?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.foodItem?.name}
                          </h3>
                          {item.foodItem?.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {item.foodItem.description}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-xs text-gray-400 mt-1 italic">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity,
                                  -1,
                                )
                              }
                              disabled={updatingItems[item._id]}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">
                              {updatingItems[item._id] ? "..." : item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item._id, item.quantity, 1)
                              }
                              disabled={updatingItems[item._id]}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          {item.foodItem?.isDiscountActive && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              {item.foodItem.discount}% OFF
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">
                            ${item.totalPrice?.toFixed(2)}
                          </p>
                          {item.foodItem?.price !== item.price && (
                            <p className="text-xs text-gray-400 line-through">
                              $
                              {(item.foodItem?.price * item.quantity).toFixed(
                                2,
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        {couponCode} applied
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full border-2 border-orange-600 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Delivery estimate: 30-45 minutes
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Free delivery on orders over $50
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
