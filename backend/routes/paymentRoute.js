const express = require("express");
const paymentController = require("../controllers/paymentController");
const bodyParser = require('body-parser');

const router = express.Router();

router.post(
  "/webhook",
  bodyParser.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

router.post("/create-payment-intent", paymentController.createPaymentIntent);
router.post("/confirm-payment", paymentController.confirmPayment);
router.post("/refund", paymentController.processRefund);
router.get("/status/:orderId", paymentController.getPaymentStatus);
router.get("/history", paymentController.getPaymentHistory);
router.post("/direct-payment", paymentController.createDirectPayment);

module.exports = router;