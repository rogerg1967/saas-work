const mongoose = require('mongoose');

const { validatePassword, isPasswordHash } = require('../utils/password.js');
const {randomUUID} = require("crypto");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    validate: { validator: isPasswordHash, message: 'Invalid password hash' },
  },
  name: {
    type: String,
    default: '',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  },
  role: {
    type: String,
    enum: ['admin', 'organization_manager', 'team_member'],
    default: 'team_member',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ['none', 'pending', 'active', 'cancelled', 'paused', 'past_due', 'unpaid', 'trialing', 'expired'],
    default: 'none',
  },
  registrationStatus: {
    type: String,
    enum: ['incomplete', 'complete', 'payment_pending'],
    default: 'incomplete',
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  paymentVerified: {
    type: Boolean,
    default: false,
  },
  subscription: {
    planId: {
      type: String,
      default: null,
    },
    planName: {
      type: String,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  paymentMethod: {
    type: String,
    default: null,
  },
  customerId: {
    type: String,
    default: null,
  },
  invoices: [{
    invoiceId: String,
    amount: Number,
    currency: String,
    status: String,
    date: Date,
    pdfUrl: String,
  }],
  refreshToken: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID(),
  },
  metadata: {
    type: Object,
    default: {},
  }, // Field for additional data like phone number
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
}, {
  versionKey: false,
});

schema.set('toJSON', {
  /* eslint-disable */
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
  /* eslint-enable */
});

const User = mongoose.model('User', schema);

module.exports = User;