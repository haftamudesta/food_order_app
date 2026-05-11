import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { getPaymentStatus } from "../../redux/actions/paymentAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const PaymentError = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { paymentStatus, loading, error } = useSelector(
    (state) => state.payment,
  );

  useEffect(() => {
    if (orderId) {
      dispatch(getPaymentStatus(orderId));
    }
  }, [dispatch, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
        <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-4">
          {error || "We couldn't process your payment. Please try again."}
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">Order ID</p>
          <p className="font-mono font-semibold">{orderId || "N/A"}</p>
          {paymentStatus && (
            <>
              <p className="text-sm text-gray-600 mt-2">Payment Status</p>
              <p className="font-semibold text-red-600">
                {paymentStatus?.status?.toUpperCase() || "FAILED"}
              </p>
            </>
          )}
        </div>
        <div className="space-y-3">
          <Link
            to={`/checkout/payment?orderId=${orderId}`}
            className="block w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            to="/checkout"
            className="block w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Return to Checkout
          </Link>
          <Link
            to="/restaurants"
            className="block w-full text-orange-600 py-3 rounded-lg font-semibold hover:text-orange-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
