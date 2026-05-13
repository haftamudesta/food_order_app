import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleOrder, cancelOrder } from "../../redux/actions/orderAction";
import {
  clearOrderError,
  clearOrderSuccess,
} from "../../redux/slices/orderSlice";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { order, loading, error, success } = useSelector(
    (state) => state.order,
  );

  useEffect(() => {
    if (id) {
      dispatch(getSingleOrder(id));
    }
    return () => {
      dispatch(clearOrderError());
      dispatch(clearOrderSuccess());
    };
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      await dispatch(cancelOrder(id));
      dispatch(getSingleOrder(id));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      delivered: "bg-green-100 text-green-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-gray-100 text-gray-800",
    };
    return styles[status?.toLowerCase()] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "confirmed":
        return <CheckCircleIcon className="w-5 h-5 text-blue-600" />;
      case "processing":
        return <TruckIcon className="w-5 h-5 text-yellow-600" />;
      case "cancelled":
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2">Error loading order</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order._id?.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusBadge(order.orderStatus)}`}
            >
              {getStatusIcon(order.orderStatus)}
              <span className="font-semibold">
                {order.orderStatus?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-orange-600" />
              Delivery Address
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>{order.deliveryInfo?.address}</p>
              <p>
                {order.deliveryInfo?.city}, {order.deliveryInfo?.postalCode}
              </p>
              <p>{order.deliveryInfo?.country}</p>
              <p className="font-medium">
                Phone: {order.deliveryInfo?.phoneNo}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-orange-600" />
              Payment Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span
                  className={`font-semibold ${
                    order.paymentInfo?.status === "paid"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.paymentInfo?.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid On:</span>
                  <span className="text-gray-900">
                    {new Date(order.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.orderItems?.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 border-b pb-4 last:border-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-600">Price: ${item.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between">
              <span className="text-gray-600">Items Price:</span>
              <span>${order.itemsPrice?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span>${order.taxPrice?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Charge:</span>
              <span>${order.deliveryCharge?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-orange-600">
                ${order.finalTotal?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {(order.orderStatus === "processing" ||
          order.orderStatus === "pending") && (
          <div className="mt-6">
            <button
              onClick={handleCancelOrder}
              className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
