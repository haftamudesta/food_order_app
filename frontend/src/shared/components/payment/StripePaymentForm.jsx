import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  confirmPayment,
  createPaymentIntent,
} from "@/redux/actions/paymentAction";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const StripePaymentForm = ({ orderId, amount, onSuccess, onError }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const { loading, error, clientSecret } = useSelector(
    (state) => state.payment,
  );
  const { user } = useSelector((state) => state.user);

  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState(null);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
        iconColor: "#9e2146",
      },
    },
    hidePostalCode: true,
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      const errorMsg = "Stripe is not initialized. Please refresh the page.";
      setPaymentError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!cardComplete) {
      const errorMsg = "Please enter complete card details.";
      setPaymentError(errorMsg);
      return;
    }

    if (!orderId) {
      const errorMsg = "Order information is missing.";
      setPaymentError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      let secret = clientSecret;

      if (!secret) {
        const result = await dispatch(
          createPaymentIntent({ orderId, paymentMethod: "credit_card" }),
        ).unwrap();
        secret = result.clientSecret;

        if (!secret) {
          throw new Error("Failed to initialize payment. Please try again.");
        }
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found.");
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(secret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.name || "Customer",
              email: user?.email || "",
            },
          },
        });

      if (confirmError) {
        // Navigate to error page - NO AUTO REDIRECT
        const errorCode = confirmError.code || "card_declined";
        navigate(
          `/payment/error/${orderId}?error_code=${errorCode}&message=${encodeURIComponent(confirmError.message)}`,
          { replace: true },
        );
        onError?.(confirmError.message);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await dispatch(
          confirmPayment({ paymentIntentId: paymentIntent.id }),
        ).unwrap();
        navigate(`/order-success/${orderId}`, { replace: true });
        onSuccess?.(paymentIntent);
      } else {
        throw new Error(`Payment ${paymentIntent?.status}. Please try again.`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err.message || "Payment processing failed";
      navigate(
        `/payment/error/${orderId}?error_code=processing_error&message=${encodeURIComponent(errorMessage)}`,
        { replace: true },
      );
      onError?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <CardElement options={cardElementOptions} onChange={handleCardChange} />
        {cardError && <p className="text-red-500 text-xs mt-2">{cardError}</p>}
      </div>

      {(paymentError || error) && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
          {paymentError || error}
        </div>
      )}

      <button
        type="submit"
        disabled={
          !stripe || !elements || !cardComplete || processing || loading
        }
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing || loading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="small" color="white" />
            <span>Processing...</span>
          </div>
        ) : (
          `Pay $${amount?.toFixed(2)}`
        )}
      </button>

      <div className="text-xs text-gray-400 text-center mt-4 p-2 bg-gray-50 rounded">
        <p>Test Card: 4242 4242 4242 4242</p>
        <p>Expiry: 12/34 | CVC: 123</p>
      </div>
    </form>
  );
};

export default StripePaymentForm;
