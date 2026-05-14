import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  confirmPayment,
  createPaymentIntent,
} from "@/redux/actions/paymentAction";
import { clearCart } from "@/redux/actions/cartAction";
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

  useEffect(() => {
    if (!orderId) {
      navigate("/checkout");
    }
  }, [orderId, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError("Stripe is not initialized. Please try again.");
      navigate(
        `/payment/error/${orderId}?error_code=processing_error&message=Stripe not initialized`,
      );
      return;
    }

    if (!orderId) {
      setPaymentError("Order information is missing.");
      navigate(
        `/payment/error?error_code=processing_error&message=Order not found`,
      );
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

      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(secret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user?.name || "Customer",
              email: user?.email || "",
              address: {
                line1: user?.address || "",
              },
            },
          },
        });

      if (confirmError) {
        const errorCode = confirmError.code || "card_declined";
        navigate(
          `/payment/error/${orderId}?error_code=${errorCode}&message=${encodeURIComponent(confirmError.message)}`,
        );
        onError?.(confirmError.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await dispatch(
          confirmPayment({ paymentIntentId: paymentIntent.id }),
        ).unwrap();

        dispatch(clearCart());

        navigate(`/order-success/${orderId}`);
        onSuccess?.(paymentIntent);
      } else {
        navigate(
          `/payment/error/${orderId}?error_code=processing_error&message=Payment ${paymentIntent.status}`,
        );
        onError?.(`Payment ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err.message || "Payment processing failed";
      navigate(
        `/payment/error/${orderId}?error_code=processing_error&message=${encodeURIComponent(errorMessage)}`,
      );
      onError?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <CardElement options={cardElementOptions} />
      </div>

      {(paymentError || error) && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
          {paymentError || error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || processing || loading}
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
    </form>
  );
};

export default StripePaymentForm;
