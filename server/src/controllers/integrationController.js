const integrationService = require('../services/integrationService');
const env = require('../config/env');

class IntegrationController {
  async list(req, res, next) {
    try {
      const integrations = await integrationService.listIntegrations(req.user._id);
      res.status(200).json({
        success: true,
        data: integrations
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const integrations = await integrationService.listIntegrations(req.user._id);
      const summary = {
        totalProviders: integrations.length,
        connectedProviders: integrations.filter(i => i.status === 'connected').length,
        providers: integrations
      };
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const state = Buffer.from(JSON.stringify({ userId: req.user._id, provider, timestamp: Date.now() })).toString('base64');
      const authUrl = await integrationService.startOAuth(provider, state);
      
      // If client requests JSON
      if (req.headers.accept?.includes('application/json') || req.query.json === 'true') {
        return res.status(200).json({
          success: true,
          data: { authUrl }
        });
      }

      res.redirect(authUrl);
    } catch (err) {
      next(err);
    }
  }

  async handleOAuthCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state, error, error_description } = req.query;

      if (error) {
        return res.redirect(`${env.CLIENT_URL}/integrations?error=${encodeURIComponent(error_description || error)}`);
      }

      let userId = req.user?._id;
      if (!userId && state) {
        try {
          const parsedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          userId = parsedState.userId;
        } catch {
          // Ignored
        }
      }

      if (!userId) {
        return res.redirect(`${env.CLIENT_URL}/integrations?error=Session+expired+during+OAuth`);
      }

      await integrationService.handleOAuthCallback(provider, code || 'mock_code', userId);
      res.redirect(`${env.CLIENT_URL}/integrations?success=${provider}`);
    } catch (err) {
      res.redirect(`${env.CLIENT_URL}/integrations?error=${encodeURIComponent(err.message)}`);
    }
  }

  async oauthError(req, res, next) {
    res.status(400).json({
      success: false,
      error: {
        code: 'OAUTH_ERROR',
        message: req.query.message || 'Third-party OAuth authorization failed or was rejected'
      }
    });
  }

  async save(req, res, next) {
    try {
      const { provider, apiKey, accessToken, config, status, accountEmail, scopes } = req.body;
      const result = await integrationService.saveCustomIntegration(req.user._id, provider, {
        apiKey,
        accessToken,
        config,
        status,
        accountEmail,
        scopes
      });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async test(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.testIntegration(req.user._id, provider);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationController();
