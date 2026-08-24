class BaseAgent {
  constructor(name) {
    this.name = name;
  }

  async emitLog(monitoringAgent, executionId, workflowId, nodeId, level, eventType, message, metadata = {}) {
    if (monitoringAgent && typeof monitoringAgent.recordEvent === 'function') {
      await monitoringAgent.recordEvent({
        executionId,
        workflowId,
        nodeId,
        agent: this.name,
        level,
        eventType,
        message,
        metadata
      });
    }
  }
}

module.exports = BaseAgent;
