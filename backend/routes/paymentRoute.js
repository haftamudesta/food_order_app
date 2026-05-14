const express = require("express");
const paymentController = require("../controllers/paymentController");
const bodyParser = require('body-parser');
const { protect } = require("../middleware/protect");

const router = express.Router();


router.post(
  "/webhook",
  bodyParser.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

router.post("/create-payment-intent",protect, paymentController.createPaymentIntent);
router.post("/confirm-payment",protect, paymentController.confirmPayment);
router.post("/refund",protect,paymentController.processRefund);
router.get("/status/:orderId",protect, paymentController.getPaymentStatus);
router.get("/history",protect,paymentController.getPaymentHistory);
router.post("/direct-payment",protect, paymentController.createDirectPayment);

module.exports = router;