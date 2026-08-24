const BaseAgent = require('./baseAgent');
const integrationService = require('../services/integrationService');
const openRouterIntegration = require('../integrations/openRouterIntegration');
const logger = require('../utils/logger');

class ExecutionAgent extends BaseAgent {
  constructor() {
    super('execution');
  }

  interpolateTemplate(template, context) {
    if (typeof template !== 'string') return template;

    return template.replace(/\{\{\s*([\w.[\]]+)\s*\}\}/g, (match, path) => {
      try {
        const parts = path.split('.');
        let current = context;
        for (const part of parts) {
          if (current === undefined || current === null) return match;
          current = current[part];
        }
        return current !== undefined && current !== null ? String(current) : match;
      } catch {
        return match;
      }
    });
  }

  resolveNodeParams(config = {}, context = {}) {
    const resolved = {};
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string') {
        resolved[key] = this.interpolateTemplate(value, context);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        resolved[key] = this.resolveNodeParams(value, context);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }

  async executeNode(node, context, userId, monitoringAgent, executionId, workflowId) {
    const nodeId = node.id;
    const nodeData = node.data || {};
    const nodeType = nodeData.nodeType || node.type;
    const category = nodeData.category || 'action';
    const label = nodeData.label || nodeId;

    await this.emitLog(
      monitoringAgent,
      executionId,
      workflowId,
      nodeId,
      'info',
      'NODE_STARTED',
      `Execution Agent started node [${label}] (${nodeType})`,
      { nodeType, category }
    );

    const startTime = Date.now();
    const resolvedConfig = this.resolveNodeParams(nodeData.config || {}, context);

    let output = null;

    try {
      // 1. Triggers
      if (category === 'trigger' || nodeType.endsWith('_trigger')) {
        output = {
          triggeredAt: new Date().toISOString(),
          triggerType: nodeType,
          payload: context.input || { status: 'triggered', source: 'Agentflow Trigger' },
          ...resolvedConfig
        };
      }

      // 2. AI Nodes
      else if (category === 'ai' || nodeType.startsWith('ai_')) {
        output = await openRouterIntegration.execute(nodeType, resolvedConfig, {
          userId
        });
      }

      // 3. Third-party Integrations (Gmail, Slack, Discord, Sheets)
      else if (nodeType === 'gmail_send' || nodeType === 'gmail_read') {
        const action = nodeType === 'gmail_send' ? 'send_email' : 'read_emails';
        output = await integrationService.executeAction(userId, 'gmail', action, resolvedConfig);
      }
      else if (nodeType === 'slack_notify' || nodeType === 'slack_message') {
        output = await integrationService.executeAction(userId, 'slack', 'slack_notify', resolvedConfig);
      }
      else if (nodeType === 'discord_notify' || nodeType === 'discord_message') {
        output = await integrationService.executeAction(userId, 'discord', 'discord_notify', resolvedConfig);
      }
      else if (nodeType === 'sheets_append' || nodeType === 'sheets_read') {
        const action = nodeType === 'sheets_append' ? 'append_row' : 'read_range';
        output = await integrationService.executeAction(userId, 'google-sheets', action, resolvedConfig);
      }

      // 4. Logic & Transformation Nodes
      else if (nodeType === 'condition_branch') {
        const { conditionField, operator, value } = resolvedConfig;
        let actualValue = context[conditionField];
        if (actualValue === undefined && conditionField) {
          actualValue = this.interpolateTemplate(`{{${conditionField}}}`, context);
        }

        let conditionPassed = false;
        switch (operator) {
          case 'greater_than':
            conditionPassed = Number(actualValue) > Number(value);
            break;
          case 'less_than':
            conditionPassed = Number(actualValue) < Number(value);
            break;
          case 'equals':
            conditionPassed = String(actualValue) === String(value);
            break;
          case 'contains':
            conditionPassed = String(actualValue).toLowerCase().includes(String(value).toLowerCase());
            break;
          default:
            conditionPassed = Boolean(actualValue);
        }

        output = {
          conditionPassed,
          evaluatedField: conditionField,
          actualValue,
          expectedValue: value,
          operator
        };
      }
      else if (nodeType === 'delay') {
        const delayMs = Math.min((parseInt(resolvedConfig.seconds, 10) || 1) * 1000, 5000);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        output = { delayedMs: delayMs, timestamp: new Date().toISOString() };
      }
      else if (nodeType === 'transformer') {
        output = {
          transformed: true,
          inputReceived: context,
          ...resolvedConfig
        };
      }
      else {
        // Fallback generic action
        output = {
          executed: true,
          nodeId,
          type: nodeType,
          timestamp: new Date().toISOString(),
          data: resolvedConfig
        };
      }

      const durationMs = Date.now() - startTime;

      await this.emitLog(
        monitoringAgent,
        executionId,
        workflowId,
        nodeId,
        'success',
        'NODE_COMPLETED',
        `Execution Agent finished node [${label}] in ${durationMs}ms`,
        { output, durationMs }
      );

      return {
        success: true,
        output,
        durationMs
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;

      await this.emitLog(
        monitoringAgent,
        executionId,
        workflowId,
        nodeId,
        'error',
        'NODE_FAILED',
        `Execution Agent encountered error in node [${label}]: ${err.message}`,
        { error: err.message, code: err.code, durationMs }
      );

      return {
        success: false,
        error: err,
        durationMs
      };
    }
  }
}

module.exports = new ExecutionAgent();
