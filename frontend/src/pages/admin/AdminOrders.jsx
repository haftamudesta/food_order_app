import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getAllOrders,
  updateOrderStatus,
} from "../../redux/actions/orderAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { allOrders, loading, totalOrders, totalAmount } = useSelector(
    (state) => state.order,
  );
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    dispatch(getAllOrders());
  };

  const filteredOrders =
    statusFilter === "all"
      ? allOrders
      : allOrders?.filter((order) => order.orderStatus === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
            <p className="text-gray-500 mt-1">
              Total Orders: {totalOrders} | Total Revenue: $
              {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-2 flex-wrap">
            {[
              "all",
              "pending",
              "processing",
              "confirmed",
              "out-for-delivery",
              "delivered",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  statusFilter === status
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {order._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.restaurant?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.finalTotal?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        className={`px-2 py-1 text-xs rounded-full border ${
                          order.orderStatus === "delivered"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : order.orderStatus === "cancelled"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : order.orderStatus === "processing"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="out-for-delivery">
                          Out for Delivery
                        </option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredOrders?.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
