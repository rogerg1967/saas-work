const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

// Update the 'updatedAt' field before saving
schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Organization = mongoose.model('Organization', schema);

module.exports = Organization;