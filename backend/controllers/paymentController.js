const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");
const Payment = require("../models/payment");
const Order = require("../models/order");
const Cart = require("../models/cart");
const stripe = require("../config/stripe");

// Create Stripe Payment Intent
exports.createPaymentIntent = catchAsyncErrors(async (req, res, next) => {
  const { orderId, paymentMethod = 'credit_card' } = req.body;
  
  // Get order details
  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return next(new AppError("Order not found", 404));
  }
  
  // Check if order belongs to user
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError("You are not authorized to pay for this order", 403));
  }
  
  // Check if payment already exists
  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment && existingPayment.status === 'completed') {
    return next(new AppError("Order already paid", 400));
  }
  
  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), 
    currency: order.currency?.toLowerCase() || 'usd',
    metadata: {
      orderId: order._id.toString(),
      userId: req.user.id,
      integration_check: 'accept_a_payment'
    },
    receipt_email: order.user.email,
    description: `Order #${order._id} - ${order.restaurant?.name || 'Food Order'}`
  });
  
  // Create payment record
  const payment = await Payment.create({
    order: orderId,
    user: req.user.id,
    amount: order.totalAmount,
    currency: order.currency || 'USD',
    method: paymentMethod,
    status: 'pending',
    transactionId: paymentIntent.id,
    metadata: {
      paymentGateway: 'stripe',
      clientSecret: paymentIntent.client_secret
    }
  });
  
  res.status(200).json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      transactionId: paymentIntent.id
    }
  });
});

// Confirm Payment (Webhook or API)
exports.confirmPayment = catchAsyncErrors(async (req, res, next) => {
  const { paymentIntentId } = req.body;
  
  // Retrieve payment intent from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status === 'succeeded') {
    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { transactionId: paymentIntentId },
      {
        status: 'completed',
        completedAt: new Date(),
        'metadata.gatewayResponse': paymentIntent,
        paymentDetails: {
          cardLast4: paymentIntent.payment_method_details?.card?.last4,
          cardBrand: paymentIntent.payment_method_details?.card?.brand
        }
      },
      { new: true }
    );
    
    // Update order status
    if (payment) {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed'
      });
      
      // Clear user's cart
      await Cart.findOneAndUpdate(
        { user: payment.user },
        { items: [], restaurant: null }
      );
    }
    
    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: payment
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Payment not successful",
      status: paymentIntent.status
    });
  }
});

// Stripe Webhook Handler
exports.stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for order ${paymentIntent.metadata.orderId} was successful!`);
      
      // Update payment record
      await Payment.findOneAndUpdate(
        { transactionId: paymentIntent.id },
        {
          status: 'completed',
          completedAt: new Date(),
          'metadata.gatewayResponse': paymentIntent,
          paymentDetails: {
            cardLast4: paymentIntent.payment_method_details?.card?.last4,
            cardBrand: paymentIntent.payment_method_details?.card?.brand
          }
        }
      );
      
      // Update order
      await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed'
      });
      
      // Clear cart
      await Cart.findOneAndUpdate(
        { user: paymentIntent.metadata.userId },
        { items: [], restaurant: null }
      );
      break;
      
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log(`Payment failed for order ${failedPaymentIntent.metadata.orderId}`);
      
      await Payment.findOneAndUpdate(
        { transactionId: failedPaymentIntent.id },
        {
          status: 'failed',
          'metadata.failureReason': failedPaymentIntent.last_payment_error?.message
        }
      );
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

// Process Refund
exports.processRefund = catchAsyncErrors(async (req, res, next) => {
  const { paymentId, amount, reason } = req.body;
  
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }
  
  if (payment.status !== 'completed') {
    return next(new AppError("Cannot refund payment that is not completed", 400));
  }
  
  // Process refund in Stripe
  const refund = await stripe.refunds.create({
    payment_intent: payment.transactionId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason: reason === 'duplicate' ? 'duplicate' : 'requested_by_customer'
  });
  
  const updatedPayment = await payment.processRefund(amount, reason);
  
  await Order.findByIdAndUpdate(payment.order, {
    paymentStatus: 'refunded',
    orderStatus: 'cancelled'
  });
  
  res.status(200).json({
    success: true,
    message: "Refund processed successfully",
    data: updatedPayment
  });
});

exports.getPaymentStatus = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  
  const payment = await Payment.findOne({ order: orderId })
    .populate('order', 'orderNumber totalAmount')
    .populate('user', 'name email');
  
  if (!payment) {
    return next(new AppError("Payment not found for this order", 404));
  }
  
  // Get latest status from Stripe
  if (payment.transactionId && payment.transactionId.startsWith('pi_')) {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionId);
    payment.status = paymentIntent.status === 'succeeded' ? 'completed' : paymentIntent.status;
  }
  
  res.status(200).json({
    success: true,
    data: payment
  });
});

// Get Payment History
exports.getPaymentHistory = catchAsyncErrors(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate('order', 'orderNumber totalAmount items')
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// Create Direct Payment (for testing)
exports.createDirectPayment = catchAsyncErrors(async (req, res, next) => {
  const { orderId, paymentMethodId } = req.body;
  
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'usd',
    payment_method: paymentMethodId,
    confirmation_method: 'manual',
    confirm: true,
    metadata: {
      orderId: order._id.toString(),
      userId: req.user.id
    }
  });
  
  // Create payment record
  const payment = await Payment.create({
    order: orderId,
    user: req.user.id,
    amount: order.totalAmount,
    currency: order.currency || 'USD',
    method: 'credit_card',
    status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
    transactionId: paymentIntent.id,
    metadata: {
      paymentGateway: 'stripe',
      gatewayResponse: paymentIntent
    }
  });
  
  if (paymentIntent.status === 'succeeded') {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed'
    });
  }
  
  res.status(200).json({
    success: true,
    data: payment
  });
});