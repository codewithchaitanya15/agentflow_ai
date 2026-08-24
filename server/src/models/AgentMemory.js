const mongoose = require('mongoose');

const agentMemorySchema = new mongoose.Schema({
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true
  },
  execution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Execution',
    required: true,
    index: true
  },
  agent: {
    type: String,
    enum: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
    required: true
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  confidence: {
    type: Number,
    default: 1.0
  }
}, {
  timestamps: true
});

agentMemorySchema.index({ execution: 1, agent: 1, key: 1 });

module.exports = mongoose.model('AgentMemory', agentMemorySchema);
