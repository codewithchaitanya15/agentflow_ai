const express = require('express');
const { body, param } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const executionController = require('../controllers/executionController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Apply auth protection to all workflow routes
router.use(protect);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.list);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
    body('nodes').optional().isArray().withMessage('Nodes must be an array'),
    body('edges').optional().isArray().withMessage('Edges must be an array')
  ],
  validate,
  workflowController.create
);

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt cannot be empty')
  ],
  validate,
  workflowController.generate
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid workflow ID')],
  validate,
  workflowController.getById
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid workflow ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
  ],
  validate,
  workflowController.update
);

router.post(
  '/:id/duplicate',
  [param('id').isMongoId().withMessage('Invalid workflow ID')],
  validate,
  workflowController.duplicate
);

router.post(
  '/:id/execute',
  [param('id').isMongoId().withMessage('Invalid workflow ID')],
  validate,
  executionController.trigger
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid workflow ID')],
  validate,
  workflowController.delete
);

module.exports = router;
