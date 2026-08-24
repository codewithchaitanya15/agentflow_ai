const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
    required: true
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'disconnected'
  },
  scopes: {
    type: [String],
    default: []
  },
  accountEmail: {
    type: String,
    default: ''
  },
  accountName: {
    type: String,
    default: ''
  },
  encryptedAccessToken: {
    type: String,
    default: null
  },
  encryptedRefreshToken: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastTestedAt: {
    type: Date,
    default: null
  },
  error: {
    code: String,
    message: String,
    lastOccurredAt: Date
  }
}, {
  timestamps: true
});

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
