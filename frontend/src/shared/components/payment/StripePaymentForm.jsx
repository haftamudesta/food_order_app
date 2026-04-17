import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  processStripePayment,
  confirmPayment,
  createPaymentIntent,
} from "../../redux/actions/paymentAction";
import LoadingSpinner from "../ui/LoadingSpinner";

const StripePaymentForm = ({ orderId, amount, onSuccess, onError }) => {
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const { loading, error, clientSecret } = useSelector(
    (state) => state.payment,
  );

  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      let secret = clientSecret;
      if (!secret) {
        const result = await dispatch(
          createPaymentIntent({ orderId, paymentMethod }),
        ).unwrap();
        secret = result.clientSecret;
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(secret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: "Customer Name",
            },
          },
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === "succeeded") {
        await dispatch(confirmPayment(paymentIntent.id));
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      console.error("Payment error:", err);
      onError?.(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || loading}
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
      >
        {processing || loading ? (
          <LoadingSpinner size="small" color="white" />
        ) : (
          `Pay $${amount?.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;
