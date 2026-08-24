const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  workflowSnapshot: {
    name: String,
    nodes: [mongoose.Schema.Types.Mixed],
    edges: [mongoose.Schema.Types.Mixed],
    triggerConfig: mongoose.Schema.Types.Mixed,
    version: Number
  },
  currentNodeId: {
    type: String,
    default: null
  },
  nodeStates: {
    type: Map,
    of: {
      status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'failed', 'retrying', 'skipped']
      },
      input: mongoose.Schema.Types.Mixed,
      output: mongoose.Schema.Types.Mixed,
      error: String,
      startedAt: Date,
      completedAt: Date,
      durationMs: Number,
      retryCount: Number
    },
    default: {}
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed,
    classifiedType: String // MISSING_FIELDS, API_FAILURE, AUTH_EXPIRED, RATE_LIMIT, TRANSIENT
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  durationMs: {
    type: Number,
    default: 0
  },
  langGraphAvailable: {
    type: Boolean,
    default: false
  },
  confidenceScore: {
    type: Number,
    default: 1.0
  }
}, {
  timestamps: true
});

executionSchema.index({ owner: 1, createdAt: -1 });
executionSchema.index({ workflow: 1, createdAt: -1 });

module.exports = mongoose.model('Execution', executionSchema);
