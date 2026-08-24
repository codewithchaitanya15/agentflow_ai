const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const orchestrator = require('../agents/orchestrator');
const { dispatchExecution } = require('../queues/executionQueue');

class ExecutionService {
  async triggerExecution(userId, workflowId, inputPayload = {}) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.code = 'WORKFLOW_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      const error = new Error('Cannot execute an empty workflow. Add at least one node.');
      error.code = 'EMPTY_WORKFLOW';
      error.statusCode = 400;
      throw error;
    }

    // Capture immutable snapshot of workflow at runtime
    const workflowSnapshot = {
      name: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
      triggerConfig: workflow.triggerConfig,
      version: workflow.version
    };

    const execution = await Execution.create({
      workflow: workflow._id,
      owner: userId,
      status: 'PENDING',
      workflowSnapshot,
      input: inputPayload,
      retryCount: 0
    });

    // Dispatch to background queue (BullMQ or In-Memory)
    await dispatchExecution(execution._id, inputPayload);

    return execution;
  }

  async listExecutions(userId, query = {}) {
    const {
      workflowId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const filter = { owner: userId };

    if (workflowId) {
      filter.workflow = workflowId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [executions, total] = await Promise.all([
      Execution.find(filter)
        .populate('workflow', 'name version status')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Execution.countDocuments(filter)
    ]);

    return {
      executions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  async getExecutionById(userId, executionId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId })
      .populate('workflow', 'name description version tags');

    if (!execution) {
      const error = new Error('Execution not found');
      error.code = 'EXECUTION_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return execution;
  }

  async getExecutionTimeline(userId, executionId) {
    // Validate ownership
    await this.getExecutionById(userId, executionId);

    const logs = await ExecutionLog.find({ execution: executionId })
      .sort({ createdAt: 1 });

    return logs;
  }

  async pauseExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (execution.status !== 'RUNNING') {
      const error = new Error(`Cannot pause execution in status ${execution.status}`);
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    const paused = orchestrator.pauseExecution(executionId);
    if (paused) {
      execution.status = 'PAUSED';
      await execution.save();
    }

    return { id: executionId, status: 'PAUSED' };
  }

  async resumeExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (execution.status !== 'PAUSED') {
      const error = new Error(`Cannot resume execution in status ${execution.status}`);
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    const resumed = orchestrator.resumeExecution(executionId);
    if (resumed) {
      execution.status = 'RUNNING';
      await execution.save();
      // Re-dispatch if needed
      await dispatchExecution(executionId, execution.input);
    }

    return { id: executionId, status: 'RUNNING' };
  }

  async cancelExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) {
      const error = new Error(`Cannot cancel execution in terminal status ${execution.status}`);
      error.code = 'ALREADY_TERMINATED';
      error.statusCode = 400;
      throw error;
    }

    orchestrator.cancelExecution(executionId);
    execution.status = 'CANCELLED';
    execution.completedAt = new Date();
    await execution.save();

    return { id: executionId, status: 'CANCELLED' };
  }
}

module.exports = new ExecutionService();
