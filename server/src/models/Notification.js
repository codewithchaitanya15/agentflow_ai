const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    default: null
  },
  execution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Execution',
    default: null
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'escalation'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

notificationSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
