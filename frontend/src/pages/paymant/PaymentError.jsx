import React, { useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { getPaymentStatus } from "@/redux/actions/paymentAction";
import {
  clearPaymentError,
  resetPaymentState,
} from "@/redux/slices/paymentSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const PaymentError = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { paymentStatus, loading, error } = useSelector(
    (state) => state.payment,
  );

  const queryParams = new URLSearchParams(location.search);
  const errorCode = queryParams.get("error_code");
  const errorMessage = queryParams.get("message");

  useEffect(() => {
    if (orderId) {
      dispatch(getPaymentStatus(orderId));
    }

    // Cleanup on unmount - NO AUTO REDIRECT
    return () => {
      dispatch(clearPaymentError());
      dispatch(resetPaymentState());
    };
  }, [dispatch, orderId]);

  // Get user-friendly error message
  const getErrorMessage = () => {
    if (errorMessage) return decodeURIComponent(errorMessage);
    if (error) return error;

    const errorMessages = {
      insufficient_funds:
        "Your card has insufficient funds for this transaction.",
      card_declined: "Your card was declined. Please try a different card.",
      expired_card: "Your card has expired. Please use a different card.",
      incorrect_cvc: "The security code (CVC) is incorrect.",
      incorrect_number: "The card number is incorrect.",
      processing_error:
        "There was an error processing your payment. Please try again.",
      authentication_required: "Your bank requires additional authentication.",
    };

    return (
      errorMessages[errorCode] ||
      "We couldn't process your payment. Please try again."
    );
  };

  const getErrorTitle = () => {
    const titles = {
      insufficient_funds: "Insufficient Funds",
      card_declined: "Card Declined",
      expired_card: "Expired Card",
      incorrect_cvc: "Incorrect Security Code",
      incorrect_number: "Invalid Card Number",
      processing_error: "Processing Error",
      authentication_required: "Authentication Required",
    };

    return titles[errorCode] || "Payment Failed";
  };

  const handleTryAgain = () => {
    dispatch(clearPaymentError());
    if (orderId) {
      navigate(`/checkout/payment?orderId=${orderId}`);
    } else {
      navigate("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
        <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getErrorTitle()}
        </h1>
        <p className="text-gray-600 mb-4">{getErrorMessage()}</p>

        <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your card has not been charged. Failed
            payments are automatically voided.
          </p>
        </div>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono font-semibold">
              {orderId.slice(-8).toUpperCase()}
            </p>
            {paymentStatus && (
              <>
                <p className="text-sm text-gray-600 mt-2">Payment Status</p>
                <p className="font-semibold text-red-600">
                  {paymentStatus?.status?.toUpperCase() || "FAILED"}
                </p>
              </>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="block w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>

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

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a
              href="mailto:support@fooddelivery.com"
              className="text-orange-600 hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
