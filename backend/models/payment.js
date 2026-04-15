const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer', 'mobile_money'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    paypalEmail: String,
    mobileNumber: String,
    provider: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    paymentGateway: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  refundDetails: {
    amount: Number,
    reason: String,
    transactionId: String,
    processedAt: Date
  },
  processedAt: Date,
  completedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

paymentSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

paymentSchema.methods.markCompleted = async function(gatewayResponse) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (gatewayResponse) {
    this.metadata.gatewayResponse = gatewayResponse;
  }
  await this.save();
  return this;
};

paymentSchema.methods.markFailed = async function(reason) {
  this.status = 'failed';
  this.metadata.failureReason = reason;
  await this.save();
  return this;
};

paymentSchema.methods.processRefund = async function(amount, reason) {
  if (this.status !== 'completed') {
    throw new Error('Cannot refund payment that is not completed');
  }
  
  this.status = 'refunded';
  this.refundDetails = {
    amount: amount || this.amount,
    reason: reason,
    transactionId: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    processedAt: new Date()
  };
  await this.save();
  return this;
};

paymentSchema.statics.getStats = async function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }}
  ]);
};

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
module.exports = Payment;