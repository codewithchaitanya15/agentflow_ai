const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const mongoose = require('mongoose');

class WorkflowService {
  async getDashboardMetrics(userId) {
    const ownerId = new mongoose.Types.ObjectId(userId);

    const [
      totalWorkflows,
      activeWorkflows,
      draftWorkflows,
      totalExecutions,
      completedExecutions,
      failedExecutions,
      runningExecutions,
      recentWorkflows,
      recentExecutions,
      recentLogs
    ] = await Promise.all([
      Workflow.countDocuments({ owner: ownerId }),
      Workflow.countDocuments({ owner: ownerId, status: 'active' }),
      Workflow.countDocuments({ owner: ownerId, status: 'draft' }),
      Execution.countDocuments({ owner: ownerId }),
      Execution.countDocuments({ owner: ownerId, status: 'COMPLETED' }),
      Execution.countDocuments({ owner: ownerId, status: 'FAILED' }),
      Execution.countDocuments({ owner: ownerId, status: 'RUNNING' }),
      Workflow.find({ owner: ownerId }).sort({ updatedAt: -1 }).limit(5),
      Execution.find({ owner: ownerId }).populate('workflow', 'name').sort({ createdAt: -1 }).limit(6),
      ExecutionLog.find({}).sort({ createdAt: -1 }).limit(8)
    ]);

    const successRate = totalExecutions > 0 
      ? Math.round((completedExecutions / totalExecutions) * 100) 
      : 100;

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        draftWorkflows,
        totalExecutions,
        completedExecutions,
        failedExecutions,
        runningExecutions,
        successRate
      },
      recentWorkflows,
      recentExecutions,
      recentAgentActivity: recentLogs
    };
  }

  async listWorkflows(userId, query = {}) {
    const {
      search = '',
      status,
      tag,
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = query;

    const filter = { owner: userId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (tag && tag !== 'all') {
      filter.tags = tag;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [workflows, total] = await Promise.all([
      Workflow.find(filter).sort(sort).skip(skip).limit(limitNum),
      Workflow.countDocuments(filter)
    ]);

    return {
      workflows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  async getWorkflowById(userId, workflowId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.code = 'WORKFLOW_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return workflow;
  }

  async createWorkflow(userId, data) {
    const workflow = await Workflow.create({
      ...data,
      owner: userId,
      version: 1
    });
    return workflow;
  }

  async updateWorkflow(userId, workflowId, updateData) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.code = 'WORKFLOW_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Check if topology changed to bump version
    const hasTopologyChanged = 
      updateData.nodes !== undefined || 
      updateData.edges !== undefined || 
      updateData.triggerConfig !== undefined;

    if (hasTopologyChanged) {
      workflow.version = (workflow.version || 1) + 1;
    }

    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'owner' && key !== 'createdAt') {
        workflow[key] = updateData[key];
      }
    });

    await workflow.save();
    return workflow;
  }

  async duplicateWorkflow(userId, workflowId) {
    const original = await this.getWorkflowById(userId, workflowId);
    
    const clone = await Workflow.create({
      name: `Copy of ${original.name}`,
      description: original.description,
      owner: userId,
      status: 'draft',
      triggerConfig: original.triggerConfig,
      nodes: original.nodes,
      edges: original.edges,
      version: 1,
      tags: [...original.tags],
      aiGenerated: original.aiGenerated,
      prompt: original.prompt
    });

    return clone;
  }

  async deleteWorkflow(userId, workflowId) {
    const workflow = await Workflow.findOneAndDelete({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.code = 'WORKFLOW_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Cleanup associated executions and logs
    await Promise.all([
      Execution.deleteMany({ workflow: workflowId }),
      ExecutionLog.deleteMany({ workflow: workflowId })
    ]);

    return { id: workflowId, deleted: true };
  }
}

module.exports = new WorkflowService();
