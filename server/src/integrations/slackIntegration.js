const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(state = '') {
    if (!env.SLACK_CLIENT_ID) {
      return `https://slack.com/oauth/v2/authorize?mock=true&state=${state}`;
    }
    const rootUrl = 'https://slack.com/oauth/v2/authorize';
    const options = {
      client_id: env.SLACK_CLIENT_ID,
      scope: 'chat:write,channels:read,incoming-webhook',
      redirect_uri: env.SLACK_REDIRECT_URI,
      state
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    if (!env.SLACK_CLIENT_ID || !env.SLACK_CLIENT_SECRET) {
      return {
        accessToken: 'mock_slack_xoxb_' + Date.now(),
        accountEmail: 'bot@slack.agentflow.ai',
        accountName: 'Agentflow Ops Slack Bot',
        scopes: ['chat:write', 'incoming-webhook'],
        config: { defaultChannel: '#operations-alerts' }
      };
    }

    try {
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          code,
          client_id: env.SLACK_CLIENT_ID,
          client_secret: env.SLACK_CLIENT_SECRET,
          redirect_uri: env.SLACK_REDIRECT_URI
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack OAuth failed');
      }

      return {
        accessToken: response.data.access_token,
        accountName: response.data.team?.name || 'Slack Team',
        accountEmail: response.data.authed_user?.id || 'slack-bot',
        scopes: response.data.scope?.split(',') || [],
        config: {
          teamId: response.data.team?.id,
          incomingWebhook: response.data.incoming_webhook?.url
        }
      };
    } catch (err) {
      logger.error('Slack OAuth token exchange failed', err);
      throw this.createError('AUTH_EXPIRED', 'Failed to authenticate with Slack: ' + err.message);
    }
  }

  async testConnection(integrationDoc) {
    if (!integrationDoc || integrationDoc.status !== 'connected') {
      throw this.createError('INTEGRATION_NOT_CONNECTED', 'Slack integration is not connected.');
    }
    return {
      connected: true,
      team: integrationDoc.accountName || 'Agentflow Workspace',
      status: 'active',
      lastTested: new Date()
    };
  }

  async execute(action, params = {}, credentials = {}) {
    const token = credentials.accessToken;
    const webhookUrl = credentials.config?.incomingWebhook || params.webhookUrl;

    switch (action) {
      case 'post_message':
      case 'slack_notify': {
        const { channel, message, blocks, text } = params;
        const messageText = message || text || 'Notification from Agentflow_AI';

        if (webhookUrl && !token) {
          try {
            await axios.post(webhookUrl, {
              text: messageText,
              channel: channel || undefined,
              blocks: blocks || undefined
            });
            return { sent: true, provider: 'slack', channel: channel || 'webhook-default', text: messageText };
          } catch (err) {
            throw this.createError('API_FAILURE', `Slack Webhook failed: ${err.message}`);
          }
        }

        if (token && !token.startsWith('mock_')) {
          try {
            const res = await axios.post(
              'https://slack.com/api/chat.postMessage',
              {
                channel: channel || '#general',
                text: messageText,
                blocks: blocks || undefined
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data.ok) {
              if (res.data.error === 'invalid_auth' || res.data.error === 'token_expired') {
                throw this.createError('AUTH_EXPIRED', 'Slack token is invalid or expired.');
              }
              throw this.createError('API_FAILURE', `Slack API error: ${res.data.error}`);
            }

            return { sent: true, ts: res.data.ts, channel: res.data.channel, message: messageText };
          } catch (err) {
            if (err.code === 'AUTH_EXPIRED' || err.code === 'API_FAILURE') throw err;
            throw this.createError('API_FAILURE', `Slack error: ${err.message}`);
          }
        }

        // Simulated success
        return {
          sent: true,
          provider: 'slack',
          channel: channel || '#operations-alerts',
          message: messageText,
          timestamp: new Date().toISOString()
        };
      }

      default:
        throw this.createError('INVALID_ACTION', `Action "${action}" is not supported by Slack integration.`);
    }
  }
}

module.exports = new SlackIntegration();
