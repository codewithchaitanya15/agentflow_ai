const Integration = require('../models/Integration');
const cryptoService = require('./cryptoService');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');
const openRouterIntegration = require('../integrations/openRouterIntegration');
const logger = require('../utils/logger');

const PROVIDERS = {
  gmail: gmailIntegration,
  slack: slackIntegration,
  discord: discordIntegration,
  'google-sheets': googleSheetsIntegration,
  openrouter: openRouterIntegration,
  gemini: openRouterIntegration
};

const ALL_PROVIDERS = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];

class IntegrationService {
  getProviderHandler(provider) {
    const handler = PROVIDERS[provider];
    if (!handler) {
      const error = new Error(`Unsupported integration provider: ${provider}`);
      error.code = 'UNSUPPORTED_PROVIDER';
      error.statusCode = 400;
      throw error;
    }
    return handler;
  }

  async listIntegrations(userId) {
    const existing = await Integration.find({ owner: userId });
    const map = new Map(existing.map(item => [item.provider, item]));

    return ALL_PROVIDERS.map(provider => {
      const item = map.get(provider);
      return {
        provider,
        status: item ? item.status : 'disconnected',
        accountEmail: item ? item.accountEmail : null,
        accountName: item ? item.accountName : null,
        scopes: item ? item.scopes : [],
        lastTestedAt: item ? item.lastTestedAt : null,
        error: item?.error?.message ? item.error : null,
        hasAccessToken: !!item?.encryptedAccessToken,
        updatedAt: item ? item.updatedAt : null
      };
    });
  }

  async getIntegration(userId, provider) {
    const integration = await Integration.findOne({ owner: userId, provider });
    return integration;
  }

  async getDecryptedCredentials(userId, provider) {
    const integration = await this.getIntegration(userId, provider);
    if (!integration) {
      return { mock: true };
    }

    const accessToken = integration.encryptedAccessToken ? cryptoService.decrypt(integration.encryptedAccessToken) : null;
    const refreshToken = integration.encryptedRefreshToken ? cryptoService.decrypt(integration.encryptedRefreshToken) : null;

    return {
      accessToken,
      refreshToken,
      scopes: integration.scopes,
      config: integration.config || {},
      mock: !accessToken
    };
  }

  async startOAuth(provider, state) {
    const handler = this.getProviderHandler(provider);
    return handler.getAuthUrl(state);
  }

  async handleOAuthCallback(provider, code, userId) {
    const handler = this.getProviderHandler(provider);
    const authData = await handler.handleCallback(code);

    const encryptedAccessToken = authData.accessToken ? cryptoService.encrypt(authData.accessToken) : null;
    const encryptedRefreshToken = authData.refreshToken ? cryptoService.encrypt(authData.refreshToken) : null;

    const integration = await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        status: 'connected',
        accountEmail: authData.accountEmail || '',
        accountName: authData.accountName || '',
        scopes: authData.scopes || [],
        encryptedAccessToken,
        encryptedRefreshToken,
        expiresAt: authData.expiresAt || null,
        config: authData.config || {},
        lastTestedAt: new Date(),
        error: null
      },
      { upsert: true, new: true }
    );

    return integration;
  }

  async saveCustomIntegration(userId, provider, data) {
    const encryptedAccessToken = data.apiKey || data.accessToken 
      ? cryptoService.encrypt(data.apiKey || data.accessToken) 
      : null;

    const integration = await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        status: data.status || 'connected',
        accountEmail: data.accountEmail || '',
        accountName: data.accountName || `${provider.toUpperCase()} Custom Setup`,
        scopes: data.scopes || [],
        encryptedAccessToken,
        config: data.config || {},
        lastTestedAt: new Date(),
        error: null
      },
      { upsert: true, new: true }
    );

    return {
      provider: integration.provider,
      status: integration.status,
      accountName: integration.accountName,
      lastTestedAt: integration.lastTestedAt
    };
  }

  async testIntegration(userId, provider) {
    const handler = this.getProviderHandler(provider);
    const integration = await this.getIntegration(userId, provider);
    
    try {
      const result = await handler.testConnection(integration);
      if (integration) {
        integration.lastTestedAt = new Date();
        integration.status = 'connected';
        integration.error = null;
        await integration.save();
      }
      return result;
    } catch (err) {
      if (integration) {
        integration.status = 'error';
        integration.error = {
          code: err.code || 'INTEGRATION_ERROR',
          message: err.message,
          lastOccurredAt: new Date()
        };
        await integration.save();
      }
      throw err;
    }
  }

  async executeAction(userId, provider, action, params) {
    const handler = this.getProviderHandler(provider);
    const credentials = await this.getDecryptedCredentials(userId, provider);
    
    try {
      return await handler.execute(action, params, credentials);
    } catch (err) {
      logger.error(`Integration action [${provider}:${action}] failed:`, err.message);
      throw err;
    }
  }
}

module.exports = new IntegrationService();
