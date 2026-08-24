const BaseAgent = require('./baseAgent');

class RecoveryAgent extends BaseAgent {
  constructor() {
    super('recovery');
  }

  classifyError(error) {
    const message = (error?.message || '').toLowerCase();
    const code = error?.code || '';

    if (code === 'AUTH_EXPIRED' || message.includes('auth') || message.includes('unauthorized') || message.includes('token') || message.includes('not connected')) {
      return 'AUTH_EXPIRED';
    }
    if (code === 'RATE_LIMIT' || message.includes('rate limit') || message.includes('429') || message.includes('quota')) {
      return 'RATE_LIMIT';
    }
    if (code === 'MISSING_FIELDS' || message.includes('missing field') || message.includes('required')) {
      return 'MISSING_FIELDS';
    }
    if (message.includes('timeout') || message.includes('econnreset') || message.includes('network') || message.includes('socket')) {
      return 'TRANSIENT';
    }
    return 'API_FAILURE';
  }

  async recover(error, node, retryCount, maxRetries = 3, monitoringAgent, executionId, workflowId) {
    const nodeId = node?.id || 'unknown';
    const label = node?.data?.label || nodeId;
    const classifiedType = this.classifyError(error);

    await this.emitLog(
      monitoringAgent,
      executionId,
      workflowId,
      nodeId,
      'warning',
      'RECOVERY_TRIGGERED',
      `Recovery Agent diagnosed error on [${label}]: Classified as ${classifiedType}`,
      {
        originalError: error.message,
        classifiedType,
        currentRetryCount: retryCount,
        maxRetries
      }
    );

    // Decision Logic
    const isRetryable = (classifiedType === 'TRANSIENT' || classifiedType === 'RATE_LIMIT' || classifiedType === 'API_FAILURE') && retryCount < maxRetries;

    if (isRetryable) {
      const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 10000);

      await this.emitLog(
        monitoringAgent,
        executionId,
        workflowId,
        nodeId,
        'info',
        'RECOVERY_RETRY',
        `Recovery Agent scheduled retry #${retryCount + 1} for node [${label}] in ${backoffMs}ms (Backoff policy applied)`,
        { retryCount: retryCount + 1, backoffMs, classifiedType }
      );

      return {
        strategy: 'retry_with_backoff',
        classifiedType,
        backoffMs,
        nextRetryCount: retryCount + 1
      };
    }

    // Escalation path
    const escalationReason = retryCount >= maxRetries 
      ? `Max retries (${maxRetries}) exceeded` 
      : `Non-retryable failure (${classifiedType})`;

    await this.emitLog(
      monitoringAgent,
      executionId,
      workflowId,
      nodeId,
      'error',
      'RECOVERY_ESCALATE',
      `Recovery Agent escalated failure on [${label}]: ${escalationReason}`,
      { escalationReason, classifiedType, fatal: true }
    );

    return {
      strategy: 'escalate',
      classifiedType,
      reason: escalationReason
    };
  }
}

module.exports = new RecoveryAgent();
