const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require("../utils/errorHandler");
const Payment = require("../models/payment");
const Order = require("../models/order");
const Cart = require("../models/cart");
const stripe = require("../config/stripe");

exports.createPaymentIntent = catchAsyncErrors(async (req, res, next) => {
  const { orderId, paymentMethod = 'credit_card' } = req.body;
  
  console.log("📝 Creating payment intent for order:", orderId);
  
  const order = await Order.findById(orderId).populate('user');
  if (!order) {
    return next(new AppError("Order not found", 404));
  }
  
  console.log("✅ Order found. Final total: $", order.finalTotal);
  
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError("You are not authorized to pay for this order", 403));
  }
  
  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment && existingPayment.status === 'completed') {
    return next(new AppError("Order already paid", 400));
  }
  
  const amountInCents = Math.round(order.finalTotal * 100);
  if (amountInCents < 50) {
    return next(new AppError("Order amount is too small. Minimum amount is $0.50", 400));
  }
  
  console.log("💰 Amount in cents:", amountInCents);
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, 
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
        integration_check: 'accept_a_payment'
      },
      receipt_email: order.user.email,
      description: `Order #${order._id}`
    });
    
    
    const payment = await Payment.create({
      order: orderId,
      user: req.user.id,
      amount: order.finalTotal,
      currency: 'USD',
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
  } catch (stripeError) {
    console.error("❌ Stripe Error:", stripeError.message);
    return next(new AppError(stripeError.message, 400));
  }
});

exports.confirmPayment = catchAsyncErrors(async (req, res, next) => {
  const { paymentIntentId } = req.body;
  
  
  
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status === 'succeeded') {
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
    
    if (payment) {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        paidAt: new Date(),
        paymentInfo: {
          id: paymentIntentId,
          status: 'completed'
        }
      });
      
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

exports.stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return res.status(500).send('Webhook secret not configured');
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`✅ Webhook received: ${event.type}`);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;
      const userId = paymentIntent.metadata?.userId;
      
      
      if (orderId && orderId !== 'test_order_123') {
        try {
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
          
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
            paidAt: new Date(),
            paymentInfo: {
              id: paymentIntent.id,
              status: 'completed'
            }
          });
          
          if (userId) {
            await Cart.findOneAndUpdate(
              { user: userId },
              { items: [], restaurant: null }
            );
          }
          
        } catch (dbError) {
          console.error(`❌ Database error processing webhook: ${dbError.message}`);
        }
      } else {
        console.log(`⚠️ Test payment ignored - no real order ID`);
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      const failedOrderId = failedPaymentIntent.metadata?.orderId;
      
      if (failedOrderId && failedOrderId !== 'test_order_123') {
        await Payment.findOneAndUpdate(
          { transactionId: failedPaymentIntent.id },
          {
            status: 'failed',
            'metadata.failureReason': failedPaymentIntent.last_payment_error?.message
          }
        );
      }
      break;
      
    case 'payment_intent.created':
      const createdIntent = event.data.object;
      console.log(`📝 Payment intent created: ${createdIntent.id}`);
      break;
      
    case 'payment_intent.processing':
      const processingIntent = event.data.object;
      console.log(`⏳ Payment processing: ${processingIntent.id}`);
      break;
      
    case 'charge.succeeded':
      const charge = event.data.object;
      console.log(`💳 Charge succeeded: ${charge.id}`);
      break;
      
    case 'charge.updated':
      const updatedCharge = event.data.object;
      console.log(`🔄 Charge updated: ${updatedCharge.id}`);
      break;
      
    case 'charge.refunded':
      const refundedCharge = event.data.object;
      console.log(`💸 Charge refunded: ${refundedCharge.id}`);
      break;
      
    default:
      console.log(`📌 Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});

exports.processRefund = catchAsyncErrors(async (req, res, next) => {
  const { paymentId, amount, reason } = req.body;
  
  console.log("📝 Processing refund for payment:", paymentId);
  
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }
  
  if (payment.status !== 'completed') {
    return next(new AppError("Cannot refund payment that is not completed", 400));
  }
  
  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.transactionId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason === 'duplicate' ? 'duplicate' : 'requested_by_customer'
    });
    
    console.log("✅ Refund processed:", refund.id);
    
    payment.status = 'refunded';
    payment.refundDetails = {
      amount: amount || payment.amount,
      reason: reason || 'customer_request',
      transactionId: refund.id,
      processedAt: new Date()
    };
    await payment.save();
    
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'refunded',
      orderStatus: 'cancelled'
    });
    
    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: payment
    });
  } catch (refundError) {
    console.error("❌ Refund error:", refundError.message);
    return next(new AppError(refundError.message, 400));
  }
});

exports.getPaymentStatus = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  
  const payment = await Payment.findOne({ order: orderId })
    .populate('order', 'finalTotal')
    .populate('user', 'name email');
  
  if (!payment) {
    return next(new AppError("Payment not found for this order", 404));
  }
  
  
  if (payment.transactionId && payment.transactionId.startsWith('pi_')) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionId);
      if (paymentIntent.status === 'succeeded' && payment.status !== 'completed') {
        payment.status = 'completed';
        await payment.save();
        console.log(`✅ Payment status updated to completed for order: ${orderId}`);
      }
    } catch (error) {
      console.error("Error fetching payment intent:", error.message);
    }
  }
  
  res.status(200).json({
    success: true,
    data: payment
  });
});

exports.getPaymentHistory = catchAsyncErrors(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate('order', 'finalTotal')
    .sort('-createdAt');
  
  
  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

exports.createDirectPayment = catchAsyncErrors(async (req, res, next) => {
  const { orderId, paymentMethodId } = req.body;
  
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.finalTotal * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id
      }
    });
    
    
    const payment = await Payment.create({
      order: orderId,
      user: req.user.id,
      amount: order.finalTotal,
      currency: 'USD',
      method: 'credit_card',
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
      transactionId: paymentIntent.id,
      metadata: {
        paymentGateway: 'stripe',
        gat
      }
    });
    
    if (paymentIntent.status === 'succeeded') {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        paidAt: new Date()
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (paymentError) {
    return next(new AppError(paymentError.message, 400));
  }
});