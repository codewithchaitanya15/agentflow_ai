const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  triggerConfig: {
    type: {
      type: String,
      enum: ['manual', 'webhook', 'cron', 'email', 'event'],
      default: 'manual'
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  nodes: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  edges: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  version: {
    type: Number,
    default: 1
  },
  tags: {
    type: [String],
    default: []
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  prompt: {
    type: String,
    default: ''
  },
  lastExecutionAt: {
    type: Date
  },
  lastExecutionStatus: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED', null],
    default: null
  },
  executionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

workflowSchema.index({ owner: 1, name: 1 });
workflowSchema.index({ status: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
