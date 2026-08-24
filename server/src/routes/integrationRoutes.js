const express = require('express');
const { body, param } = require('express-validator');
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// OAuth callback routes (can be accessed with state redirect)
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);
router.get('/oauth/error', integrationController.oauthError);

// Protected routes
router.get('/oauth/:provider/start', protect, integrationController.startOAuth);
router.get('/status', protect, integrationController.getStatus);
router.get('/', protect, integrationController.list);

router.post(
  '/',
  protect,
  [
    body('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini']).withMessage('Invalid provider')
  ],
  validate,
  integrationController.save
);

router.post(
  '/:provider/test',
  protect,
  [
    param('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini']).withMessage('Invalid provider')
  ],
  validate,
  integrationController.test
);

module.exports = router;
