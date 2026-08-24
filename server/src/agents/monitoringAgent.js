const BaseAgent = require('./baseAgent');
const ExecutionLog = require('../models/ExecutionLog');
const AgentMemory = require('../models/AgentMemory');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

class MonitoringAgent extends BaseAgent {
  constructor() {
    super('monitoring');
  }

  async recordEvent({
    executionId,
    workflowId,
    nodeId = null,
    agent,
    level = 'info',
    eventType,
    message,
    metadata = {}
  }) {
    try {
      // 1. Persist in MongoDB
      const logEntry = await ExecutionLog.create({
        execution: executionId,
        workflow: workflowId,
        nodeId,
        agent,
        level,
        eventType,
        message,
        metadata
      });

      // 2. Broadcast over Socket.IO to live subscribers
      const io = getIO();
      if (io) {
        io.to(`execution:${executionId}`).emit('agent-event', {
          logId: logEntry._id,
          executionId,
          workflowId,
          nodeId,
          agent,
          level,
          eventType,
          message,
          metadata,
          timestamp: logEntry.createdAt
        });
      }

      // 3. Save memory state if event contains reasoning / plan
      if (metadata.confidenceScore !== undefined || metadata.strategy) {
        await AgentMemory.create({
          workflow: workflowId,
          execution: executionId,
          agent,
          key: eventType,
          value: metadata,
          confidence: metadata.confidenceScore || 1.0
        });
      }

      logger.debug(`[Agent Timeline] [${agent.toUpperCase()}] ${eventType}: ${message}`);
      return logEntry;
    } catch (err) {
      logger.error('Failed to record monitoring event', err);
    }
  }

  async broadcastStatus(executionId, statusPayload) {
    const io = getIO();
    if (io) {
      io.to(`execution:${executionId}`).emit('execution-status', {
        executionId,
        ...statusPayload,
        timestamp: new Date()
      });
    }
  }
}

module.exports = new MonitoringAgent();
