const executionService = require('../services/executionService');

class ExecutionController {
  async trigger(req, res, next) {
    try {
      const execution = await executionService.triggerExecution(
        req.user._id,
        req.params.id,
        req.body?.input || {}
      );
      res.status(201).json({
        success: true,
        data: execution
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const result = await executionService.listExecutions(req.user._id, req.query);
      res.status(200).json({
        success: true,
        data: result.executions,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: execution
      });
    } catch (err) {
      next(err);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const timeline = await executionService.getExecutionTimeline(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: timeline
      });
    } catch (err) {
      next(err);
    }
  }

  async pause(req, res, next) {
    try {
      const result = await executionService.pauseExecution(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async resume(req, res, next) {
    try {
      const result = await executionService.resumeExecution(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async cancel(req, res, next) {
    try {
      const result = await executionService.cancelExecution(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExecutionController();
