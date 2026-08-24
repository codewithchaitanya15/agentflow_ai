const express = require('express');
const { param } = require('express-validator');
const executionController = require('../controllers/executionController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Protected routes
router.use(protect);

router.get('/', executionController.list);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid execution ID')],
  validate,
  executionController.getById
);

router.get(
  '/:id/timeline',
  [param('id').isMongoId().withMessage('Invalid execution ID')],
  validate,
  executionController.getTimeline
);

router.post(
  '/:id/pause',
  [param('id').isMongoId().withMessage('Invalid execution ID')],
  validate,
  executionController.pause
);

router.post(
  '/:id/resume',
  [param('id').isMongoId().withMessage('Invalid execution ID')],
  validate,
  executionController.resume
);

router.post(
  '/:id/cancel',
  [param('id').isMongoId().withMessage('Invalid execution ID')],
  validate,
  executionController.cancel
);

module.exports = router;
