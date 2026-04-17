import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "../../components/payment/StripePaymentForm";
import { createOrder } from "../../redux/actions/orderAction";
import { clearCart } from "../../redux/actions/cartAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, total, items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [orderId, setOrderId] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateOrder = async () => {
    if (!deliveryAddress.street || !deliveryAddress.city) {
      alert("Please fill in delivery address");
      return;
    }

    setCreatingOrder(true);
    try {
      const orderData = {
        restaurant: cart.restaurant?._id,
        items: items.map((item) => ({
          foodItem: item.foodItem._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        deliveryAddress,
        paymentMethod: "credit_card",
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      setOrderId(result.order._id);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    // Clear cart after successful payment
    await dispatch(clearCart());
    navigate(`/order-success/${orderId}`);
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    alert(`Payment failed: ${error}`);
  };

  if (creatingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <div>
                      <span className="font-medium">
                        {item.quantity}x {item.foodItem?.name}
                      </span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cart.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${cart.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {cart.deliveryFee === 0
                      ? "Free"
                      : `$${cart.deliveryFee?.toFixed(2)}`}
                  </span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${cart.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-orange-600">${total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

              <div className="space-y-3">
                <input
                  type="text"
                  name="street"
                  placeholder="Street Address"
                  value={deliveryAddress.street}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={deliveryAddress.state}
                    onChange={handleAddressChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={deliveryAddress.zipCode}
                    onChange={handleAddressChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={deliveryAddress.phone}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>

              {!orderId ? (
                <button
                  onClick={handleCreateOrder}
                  disabled={creatingOrder}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Proceed to Payment
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
