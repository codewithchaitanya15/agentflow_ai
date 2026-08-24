const BaseAgent = require('./baseAgent');

class ValidationAgent extends BaseAgent {
  constructor() {
    super('validation');
  }

  async validate(node, output, monitoringAgent, executionId, workflowId) {
    const nodeId = node.id;
    const nodeData = node.data || {};
    const label = nodeData.label || nodeId;

    if (output === null || output === undefined) {
      const error = new Error(`Node output is null or undefined for [${label}]`);
      error.code = 'MISSING_FIELDS';

      await this.emitLog(
        monitoringAgent,
        executionId,
        workflowId,
        nodeId,
        'error',
        'VALIDATION_FAILED',
        `Validation Agent rejected output for node [${label}]: Empty output payload`,
        { nodeId, reason: 'NULL_OUTPUT' }
      );

      return {
        isValid: false,
        error
      };
    }

    // Check custom required fields if specified
    const requiredFields = nodeData.config?.requiredOutputs || [];
    const missing = [];

    if (Array.isArray(requiredFields)) {
      requiredFields.forEach(field => {
        if (output[field] === undefined || output[field] === null || output[field] === '') {
          missing.push(field);
        }
      });
    }

    if (missing.length > 0) {
      const error = new Error(`Missing required output fields: ${missing.join(', ')}`);
      error.code = 'MISSING_FIELDS';
      error.details = { missingFields: missing };

      await this.emitLog(
        monitoringAgent,
        executionId,
        workflowId,
        nodeId,
        'warning',
        'VALIDATION_FAILED',
        `Validation Agent detected missing fields on [${label}]: ${missing.join(', ')}`,
        { missing }
      );

      return {
        isValid: false,
        error
      };
    }

    await this.emitLog(
      monitoringAgent,
      executionId,
      workflowId,
      nodeId,
      'info',
      'VALIDATION_PASSED',
      `Validation Agent verified data integrity for node [${label}]`,
      { fieldsChecked: Object.keys(output).length }
    );

    return {
      isValid: true,
      validatedOutput: output
    };
  }
}

module.exports = new ValidationAgent();
