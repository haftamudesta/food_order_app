import React from "react";
import { Link } from "react-router-dom";
import { MapPinIcon, EyeIcon } from "@heroicons/react/24/outline";

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "✅";
      case "confirmed":
        return "✓";
      case "processing":
        return "⏳";
      case "cancelled":
        return "❌";
      default:
        return "📦";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">
              Order #{order._id?.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}
          >
            <span className="mr-1">{getStatusIcon(order.orderStatus)}</span>
            {order.orderStatus?.toUpperCase()}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-lg text-gray-900">
            {order.restaurant?.name || "Restaurant"}
          </h3>
          {order.restaurant?.address && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPinIcon className="w-4 h-4" />
              <span>
                {order.restaurant.address.city},{" "}
                {order.restaurant.address.state}
              </span>
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 pt-3 mb-3">
          <p className="text-sm text-gray-600 mb-2">
            {order.orderItems?.length}{" "}
            {order.orderItems?.length === 1 ? "item" : "items"}:
          </p>
          <div className="space-y-1">
            {order.orderItems?.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-gray-800 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {order.orderItems?.length > 3 && (
              <p className="text-xs text-gray-400">
                +{order.orderItems.length - 3} more items
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">
              Total Amount
            </span>
            <span className="text-xl font-bold text-orange-600">
              ${order.finalTotal?.toFixed(2)}
            </span>
          </div>
        </div>
        <Link
          to={`/orders/${order._id}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          View Order Details
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
