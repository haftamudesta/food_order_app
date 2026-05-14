import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "@/shared/components/payment/StripePaymentForm";
import { createOrder } from "../../redux/actions/orderAction";
import { clearCart } from "@/redux/actions/cartAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  MapPinIcon,
  CreditCardIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

console.log();
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const { loading: orderLoading } = useSelector((state) => state.order);

  const [orderId, setOrderId] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    phoneNo: "",
    country: "USA",
  });

  useEffect(() => {
    if (items.length === 0 && !creatingOrder) {
      navigate("/cart");
    }
  }, [items, navigate, creatingOrder]);

  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateOrder = async () => {
    if (
      !deliveryAddress.address ||
      !deliveryAddress.city ||
      !deliveryAddress.phoneNo
    ) {
      alert("Please fill in all required delivery address fields");
      return;
    }

    if (!cart.restaurant?._id) {
      alert("Restaurant information is missing");
      return;
    }

    setCreatingOrder(true);
    try {
      const orderData = {
        deliveryInfo: {
          address: deliveryAddress.address,
          city: deliveryAddress.city,
          postalCode: deliveryAddress.postalCode,
          phoneNo: deliveryAddress.phoneNo,
          country: deliveryAddress.country,
        },
        restaurant: cart.restaurant._id,
        orderItems: items.map((item) => ({
          name: item.foodItem?.name,
          quantity: item.quantity,
          image: item.foodItem?.image?.url || item.foodItem?.image || "",
          price: item.price,
          foodItem: item.foodItem._id,
        })),
        itemsPrice:
          cart.subtotal || total - (cart.tax || 0) - (cart.deliveryFee || 0),
        taxPrice: cart.tax || 0,
        deliveryCharge: cart.deliveryFee || 0,
        finalTotal: total,
        paymentInfo: {
          status: "pending",
        },
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      setOrderId(result._id);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert(error || "Failed to create order. Please try again.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    await dispatch(clearCart());
    navigate(`/order-success/${orderId}`);
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    navigate(
      `/payment/error/${orderId}?error_code=processing_error&message=${encodeURIComponent(error)}`,
    );
  };

  if (creatingOrder || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBagIcon className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.foodItem?.image?.url ? (
                          <img
                            src={item.foodItem.image.url}
                            alt={item.foodItem.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.quantity}x {item.foodItem?.name}
                        </span>
                        <p className="text-xs text-gray-500">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    ${(cart.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (10%)</span>
                  <span className="text-gray-900">
                    ${(cart.tax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="text-gray-900">
                    {cart.deliveryFee === 0
                      ? "Free"
                      : `$${(cart.deliveryFee || 0).toFixed(2)}`}
                  </span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${cart.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-orange-600">
                    ${(total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Delivery & Payment */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold">Delivery Address</h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address *"
                  value={deliveryAddress.address}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={deliveryAddress.city}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={deliveryAddress.postalCode}
                    onChange={handleAddressChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={deliveryAddress.country}
                    onChange={handleAddressChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="tel"
                  name="phoneNo"
                  placeholder="Phone Number *"
                  value={deliveryAddress.phoneNo}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCardIcon className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold">Payment</h2>
              </div>

              {!orderId ? (
                <button
                  onClick={handleCreateOrder}
                  disabled={creatingOrder}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingOrder ? "Creating Order..." : "Proceed to Payment"}
                </button>
              ) : (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    orderId={orderId}
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              )}
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> By proceeding with payment, you agree to
                our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
