const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const Notification = require('../models/Notification');
const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const logger = require('../utils/logger');
const { getIO } = require('../config/socket');

class Orchestrator {
  constructor() {
    this.activeExecutions = new Map(); // executionId -> { status: 'running' | 'paused' | 'cancelled', cancelPromise }
  }

  detectLangGraph() {
    try {
      require.resolve('@langchain/langgraph');
      return 'available';
    } catch {
      try {
        require.resolve('langgraph');
        return 'available';
      } catch {
        return 'not-installed';
      }
    }
  }

  async runWorkflow(executionId, inputPayload = {}) {
    const execution = await Execution.findById(executionId).populate('workflow');
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const workflow = execution.workflow;
    const userId = execution.owner;
    const langGraphStatus = this.detectLangGraph();

    execution.status = 'RUNNING';
    execution.startedAt = new Date();
    execution.langGraphAvailable = langGraphStatus === 'available';
    await execution.save();

    this.activeExecutions.set(String(executionId), { status: 'running' });

    await monitoringAgent.recordEvent({
      executionId,
      workflowId: workflow._id,
      agent: 'monitoring',
      level: 'info',
      eventType: 'EXECUTION_STARTED',
      message: `Orchestrator initiated execution of [${workflow.name}] (LangGraph: ${langGraphStatus})`,
      metadata: { langGraphStatus, inputPayload }
    });

    monitoringAgent.broadcastStatus(executionId, { status: 'RUNNING', startedAt: execution.startedAt });

    const context = {
      input: inputPayload,
      workflowId: workflow._id,
      executionId
    };

    let totalDurationMs = 0;
    const startTime = Date.now();

    try {
      // 1. Planner Phase
      const planResult = await plannerAgent.plan(workflow, monitoringAgent, executionId);
      const { orderedNodeIds, nodeMap, confidenceScore } = planResult;
      
      execution.confidenceScore = confidenceScore;
      await execution.save();

      // 2. Execution Chain Phase
      for (let i = 0; i < orderedNodeIds.length; i++) {
        const nodeId = orderedNodeIds[i];
        const node = nodeMap.get(nodeId);
        if (!node) continue;

        // Check if execution was paused or cancelled
        const controlState = this.activeExecutions.get(String(executionId));
        if (controlState?.status === 'cancelled') {
          execution.status = 'CANCELLED';
          execution.completedAt = new Date();
          execution.durationMs = Date.now() - startTime;
          await execution.save();

          await monitoringAgent.recordEvent({
            executionId,
            workflowId: workflow._id,
            nodeId,
            agent: 'monitoring',
            level: 'warning',
            eventType: 'EXECUTION_CANCELLED',
            message: `Execution cancelled by operator during node [${node.data?.label || nodeId}]`,
            metadata: { stoppedAtNode: nodeId }
          });

          monitoringAgent.broadcastStatus(executionId, { status: 'CANCELLED' });
          return;
        }

        if (controlState?.status === 'paused') {
          execution.status = 'PAUSED';
          execution.currentNodeId = nodeId;
          await execution.save();

          await monitoringAgent.recordEvent({
            executionId,
            workflowId: workflow._id,
            nodeId,
            agent: 'monitoring',
            level: 'info',
            eventType: 'EXECUTION_PAUSED',
            message: `Execution paused at node [${node.data?.label || nodeId}]`,
            metadata: { pausedAtNode: nodeId }
          });

          monitoringAgent.broadcastStatus(executionId, { status: 'PAUSED', currentNodeId: nodeId });
          return;
        }

        execution.currentNodeId = nodeId;
        await execution.save();
        monitoringAgent.broadcastStatus(executionId, { currentNodeId: nodeId, progress: Math.round(((i + 1) / orderedNodeIds.length) * 100) });

        let nodeSuccess = false;
        let retryCount = 0;
        const maxRetries = 3;
        let nodeOutput = null;

        while (!nodeSuccess && retryCount <= maxRetries) {
          // Execution Agent Step
          const execResult = await executionAgent.executeNode(
            node,
            context,
            userId,
            monitoringAgent,
            executionId,
            workflow._id
          );

          if (execResult.success) {
            // Validation Agent Step
            const valResult = await validationAgent.validate(
              node,
              execResult.output,
              monitoringAgent,
              executionId,
              workflow._id
            );

            if (valResult.isValid) {
              nodeSuccess = true;
              nodeOutput = valResult.validatedOutput;
              
              // Store in context for subsequent nodes
              context[nodeId] = { output: nodeOutput };
              context[`node_${i + 1}`] = { output: nodeOutput };
              if (node.data?.label) {
                context[node.data.label.replace(/\s+/g, '_').toLowerCase()] = { output: nodeOutput };
              }

              // Update nodeStates map on execution document
              if (!execution.nodeStates) execution.nodeStates = new Map();
              execution.nodeStates.set(nodeId, {
                status: 'completed',
                input: context,
                output: nodeOutput,
                completedAt: new Date(),
                durationMs: execResult.durationMs,
                retryCount
              });
              await execution.save();
            } else {
              // Validation failure -> Recovery Agent
              const recResult = await recoveryAgent.recover(
                valResult.error,
                node,
                retryCount,
                maxRetries,
                monitoringAgent,
                executionId,
                workflow._id
              );

              if (recResult.strategy === 'retry_with_backoff') {
                retryCount = recResult.nextRetryCount;
                await new Promise(r => setTimeout(r, recResult.backoffMs));
              } else {
                throw valResult.error;
              }
            }
          } else {
            // Execution failure -> Recovery Agent
            const recResult = await recoveryAgent.recover(
              execResult.error,
              node,
              retryCount,
              maxRetries,
              monitoringAgent,
              executionId,
              workflow._id
            );

            if (recResult.strategy === 'retry_with_backoff') {
              retryCount = recResult.nextRetryCount;
              await new Promise(r => setTimeout(r, recResult.backoffMs));
            } else {
              throw execResult.error;
            }
          }
        }
      }

      // 3. Final Success
      totalDurationMs = Date.now() - startTime;
      execution.status = 'COMPLETED';
      execution.completedAt = new Date();
      execution.durationMs = totalDurationMs;
      execution.output = context;
      await execution.save();

      // Update workflow stats
      workflow.lastExecutionAt = new Date();
      workflow.lastExecutionStatus = 'COMPLETED';
      workflow.executionCount = (workflow.executionCount || 0) + 1;
      await workflow.save();

      await monitoringAgent.recordEvent({
        executionId,
        workflowId: workflow._id,
        agent: 'monitoring',
        level: 'success',
        eventType: 'EXECUTION_COMPLETED',
        message: `Workflow [${workflow.name}] completed all steps successfully in ${totalDurationMs}ms`,
        metadata: { durationMs: totalDurationMs, stepsCompleted: orderedNodeIds.length }
      });

      // Create Notification
      const notif = await Notification.create({
        owner: userId,
        workflow: workflow._id,
        execution: executionId,
        type: 'success',
        title: `Workflow Succeeded: ${workflow.name}`,
        message: `Executed ${orderedNodeIds.length} steps in ${(totalDurationMs / 1000).toFixed(1)}s.`
      });

      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notification', notif);
      }

      monitoringAgent.broadcastStatus(executionId, { status: 'COMPLETED', durationMs: totalDurationMs, progress: 100 });
      this.activeExecutions.delete(String(executionId));

    } catch (error) {
      totalDurationMs = Date.now() - startTime;
      execution.status = 'FAILED';
      execution.completedAt = new Date();
      execution.durationMs = totalDurationMs;
      execution.error = {
        code: error.code || 'EXECUTION_FAILED',
        message: error.message,
        classifiedType: recoveryAgent.classifyError(error)
      };
      await execution.save();

      workflow.lastExecutionAt = new Date();
      workflow.lastExecutionStatus = 'FAILED';
      workflow.executionCount = (workflow.executionCount || 0) + 1;
      await workflow.save();

      await monitoringAgent.recordEvent({
        executionId,
        workflowId: workflow._id,
        agent: 'monitoring',
        level: 'error',
        eventType: 'EXECUTION_FAILED',
        message: `Execution halted with fatal error: ${error.message}`,
        metadata: { error: error.message, code: error.code, classifiedType: execution.error.classifiedType }
      });

      // Create Notification for failure/escalation
      const notif = await Notification.create({
        owner: userId,
        workflow: workflow._id,
        execution: executionId,
        type: 'escalation',
        title: `Execution Failed: ${workflow.name}`,
        message: `Halted at node [${execution.currentNodeId}]: ${error.message}`
      });

      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notification', notif);
      }

      monitoringAgent.broadcastStatus(executionId, { status: 'FAILED', error: execution.error, durationMs: totalDurationMs });
      this.activeExecutions.delete(String(executionId));
    }
  }

  pauseExecution(executionId) {
    const active = this.activeExecutions.get(String(executionId));
    if (active) {
      active.status = 'paused';
      return true;
    }
    return false;
  }

  resumeExecution(executionId) {
    const active = this.activeExecutions.get(String(executionId));
    if (active && active.status === 'paused') {
      active.status = 'running';
      return true;
    }
    return false;
  }

  cancelExecution(executionId) {
    const active = this.activeExecutions.get(String(executionId));
    if (active) {
      active.status = 'cancelled';
      return true;
    }
    return false;
  }
}

module.exports = new Orchestrator();
