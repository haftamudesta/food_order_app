import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { getSingleOrder } from "../../redux/actions/orderAction";
import { clearCart } from "../../redux/actions/cartAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { order, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (!orderId) {
      navigate("/orders");
      return;
    }

    dispatch(getSingleOrder(orderId));
    dispatch(clearCart());
  }, [dispatch, orderId, navigate]);

  const estimatedDelivery = new Date();
  estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 45);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-20 h-20 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your order details.
          </p>
          <Link
            to="/orders"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-green-600 to-green-500 px-6 py-8 sm:px-10">
            <div className="flex justify-center">
              <div className="rounded-full bg-white p-3">
                <CheckCircleIcon className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white text-center">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-green-100 text-center">
              Thank you for your order,{" "}
              {user?.name?.split(" ")[0] || "Customer"}
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="mt-1 font-mono font-semibold text-gray-900">
                    #{order._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.orderStatus?.toUpperCase() || "CONFIRMED"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.paymentInfo?.status?.toUpperCase() || "PAID"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="mt-1 text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-3">
                {order.orderItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-b border-gray-200 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    ${order.itemsPrice?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">
                    ${order.taxPrice?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="text-gray-900">
                    ${order.deliveryCharge?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span>Total Paid</span>
                  <span className="text-green-600">
                    ${order.finalTotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="text-gray-900 mt-1">
                    {order.deliveryInfo?.address}, {order.deliveryInfo?.city}
                  </p>
                  <p className="text-gray-900">
                    {order.deliveryInfo?.postalCode},{" "}
                    {order.deliveryInfo?.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="text-gray-900 mt-1">
                    {order.deliveryInfo?.phoneNo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="text-gray-900 mt-1 font-medium">
                    {estimatedDelivery.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    You will receive a confirmation call before delivery
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Link
                to={`/order-tracking/${order._id}`}
                className="flex-1 bg-orange-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <ClipboardDocumentListIcon className="h-5 w-5" />
                Track Order
              </Link>
              <Link
                to="/orders"
                className="flex-1 border-2 border-orange-600 text-orange-600 text-center px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                My Orders
              </Link>
              <Link
                to="/restaurants"
                className="flex-1 bg-gray-100 text-gray-700 text-center px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <HomeIcon className="h-5 w-5" />
                Order More
              </Link>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                What happens next?
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-600 font-bold">1.</span>
                  <span>Restaurant confirms your order</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-600 font-bold">2.</span>
                  <span>Food is prepared fresh</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-600 font-bold">3.</span>
                  <span>Delivery partner picks up your order</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-600 font-bold">4.</span>
                  <span>Food delivered to your doorstep</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
