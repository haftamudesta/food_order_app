import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  XCircleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { getPaymentStatus } from "../../redux/actions/paymentAction";
import {
  clearPaymentError,
  resetPaymentState,
} from "../../redux/slices/paymentSlice";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const PaymentError = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { paymentStatus, loading, error } = useSelector(
    (state) => state.payment,
  );

  const [countdown, setCountdown] = useState(5);

  const queryParams = new URLSearchParams(location.search);
  const errorCode = queryParams.get("error_code");
  const errorMessage = queryParams.get("message");

  useEffect(() => {
    if (orderId) {
      dispatch(getPaymentStatus(orderId));
    }

    return () => {
      dispatch(clearPaymentError());
      dispatch(resetPaymentState());
    };
  }, [dispatch, orderId]);

  // Auto-redirect to home after 10 seconds
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/");
    }
  }, [countdown, navigate]);

  // Error message mapping
  const getErrorMessage = () => {
    if (errorMessage) return decodeURIComponent(errorMessage);
    if (error) return error;

    const errorMessages = {
      insufficient_funds:
        "Your card has insufficient funds for this transaction.",
      card_declined:
        "Your card was declined by your bank. Please try a different card.",
      expired_card:
        "The card you're using has expired. Please use a different card.",
      incorrect_cvc: "The security code (CVC) you entered is incorrect.",
      processing_error:
        "There was an error processing your payment. Please try again.",
      authentication_required:
        "Your bank requires additional authentication. Please try again.",
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
      processing_error: "Processing Error",
      authentication_required: "Authentication Required",
    };

    return titles[errorCode] || "Payment Failed";
  };

  const handleRetry = () => {
    dispatch(clearPaymentError());
    dispatch(resetPaymentState());

    if (orderId) {
      navigate(`/checkout/payment?orderId=${orderId}&retry=true`);
    } else {
      navigate("/checkout");
    }
  };

  const handleUseDifferentMethod = () => {
    dispatch(clearPaymentError());
    if (orderId) {
      navigate(`/checkout/payment?orderId=${orderId}&method=alternative`);
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
    <div className="min-h-screen bg-linear-to-b from-red-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-red-600 to-red-500 px-6 py-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-white p-3">
                <XCircleIcon className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white text-center">
              {getErrorTitle()}
            </h1>
            <p className="mt-2 text-red-100 text-center text-sm">
              We couldn't process your payment
            </p>
          </div>

          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <p className="text-gray-600">{getErrorMessage()}</p>
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Your card has not been charged. Failed
                  payments are automatically voided.
                </p>
              </div>
            </div>
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 text-center">Order ID</p>
                <p className="font-mono font-semibold text-center">
                  {orderId.slice(-8).toUpperCase()}
                </p>
                {paymentStatus && (
                  <>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Payment Status
                    </p>
                    <p className="font-semibold text-red-600 text-center">
                      {paymentStatus?.status?.toUpperCase() || "FAILED"}
                    </p>
                  </>
                )}
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Try Again
              </button>

              <button
                onClick={handleUseDifferentMethod}
                className="w-full border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCardIcon className="h-5 w-5" />
                Use Different Card
              </button>

              <Link
                to="/checkout"
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Return to Checkout
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
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

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Redirecting to home page in {countdown} seconds...
              </p>
              <Link
                to="/"
                className="text-xs text-orange-600 hover:underline mt-1 inline-block"
              >
                Go now
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4 text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <span className="text-gray-300">•</span>
          <Link to="/orders" className="text-gray-500 hover:text-gray-700">
            My Orders
          </Link>
          <span className="text-gray-300">•</span>
          <Link to="/restaurants" className="text-gray-500 hover:text-gray-700">
            Restaurants
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
