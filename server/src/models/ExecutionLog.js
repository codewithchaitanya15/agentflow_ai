const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema({
  execution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Execution',
    required: true,
    index: true
  },
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true
  },
  nodeId: {
    type: String,
    default: null
  },
  agent: {
    type: String,
    enum: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  eventType: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

executionLogSchema.index({ execution: 1, createdAt: 1 });

module.exports = mongoose.model('ExecutionLog', executionLogSchema);
