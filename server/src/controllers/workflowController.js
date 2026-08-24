const workflowService = require('../services/workflowService');
const aiWorkflowService = require('../services/aiWorkflowService');

class WorkflowController {
  async getDashboard(req, res, next) {
    try {
      const data = await workflowService.getDashboardMetrics(req.user._id);
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const result = await workflowService.listWorkflows(req.user._id, req.query);
      res.status(200).json({
        success: true,
        data: result.workflows,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: workflow
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user._id, req.body);
      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (err) {
      next(err);
    }
  }

  async generate(req, res, next) {
    try {
      const { prompt } = req.body;
      const generated = await aiWorkflowService.generateWorkflow(prompt);
      res.status(200).json({
        success: true,
        data: generated
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.user._id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: workflow
      });
    } catch (err) {
      next(err);
    }
  }

  async duplicate(req, res, next) {
    try {
      const cloned = await workflowService.duplicateWorkflow(req.user._id, req.params.id);
      res.status(201).json({
        success: true,
        data: cloned
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await workflowService.deleteWorkflow(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkflowController();
