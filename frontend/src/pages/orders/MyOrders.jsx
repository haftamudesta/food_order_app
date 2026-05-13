import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { myOrders } from "../../redux/actions/orderAction";
import { clearOrderError } from "../../redux/slices/orderSlice";
import OrderCard from "../../shared/components/cards/OrderCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, totalOrders } = useSelector(
    (state) => state.order,
  );
  const [filterStatus, setFilterStatus] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    dispatch(myOrders());
    return () => {
      dispatch(clearOrderError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      if (filterStatus === "all") {
        setFilteredOrders(orders);
      } else {
        setFilteredOrders(
          orders.filter(
            (order) =>
              order.orderStatus?.toLowerCase() === filterStatus.toLowerCase(),
          ),
        );
      }
    }
  }, [orders, filterStatus]);

  const statusFilters = [
    { value: "all", label: "All Orders", count: orders?.length || 0 },
    {
      value: "processing",
      label: "Processing",
      count: orders?.filter((o) => o.orderStatus === "processing").length || 0,
    },
    {
      value: "confirmed",
      label: "Confirmed",
      count: orders?.filter((o) => o.orderStatus === "confirmed").length || 0,
    },
    {
      value: "delivered",
      label: "Delivered",
      count: orders?.filter((o) => o.orderStatus === "delivered").length || 0,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: orders?.filter((o) => o.orderStatus === "cancelled").length || 0,
    },
  ];

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
          <div className="text-red-600 text-lg mb-2">Error loading orders</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => dispatch(myOrders())}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track and manage all your orders in one place
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`p-4 rounded-lg text-center transition-all ${
                filterStatus === filter.value
                  ? "bg-orange-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:shadow-md"
              }`}
            >
              <div className="text-2xl font-bold">{filter.count}</div>
              <div className="text-sm mt-1">{filter.label}</div>
            </button>
          ))}
        </div>
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBagIcon className="w-20 h-20 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === "all"
                ? "You haven't placed any orders yet."
                : `You don't have any ${filterStatus} orders.`}
            </p>
            <a
              href="/restaurants"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse Restaurants
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
