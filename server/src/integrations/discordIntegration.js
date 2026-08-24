const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(state = '') {
    if (!env.DISCORD_CLIENT_ID) {
      return `https://discord.com/api/oauth2/authorize?mock=true&state=${state}`;
    }
    const rootUrl = 'https://discord.com/api/oauth2/authorize';
    const options = {
      client_id: env.DISCORD_CLIENT_ID,
      permissions: '2048', // Send Messages
      scope: 'bot applications.commands',
      redirect_uri: env.DISCORD_REDIRECT_URI,
      response_type: 'code',
      state
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
      return {
        accessToken: 'mock_discord_bot_' + Date.now(),
        accountName: 'Agentflow Bot',
        accountEmail: 'bot@discord.agentflow.ai',
        scopes: ['bot'],
        config: { defaultGuild: 'Agentflow Ops Guild', defaultChannel: '#general' }
      };
    }

    try {
      const response = await axios.post(
        'https://discord.com/api/v10/oauth2/token',
        new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: env.DISCORD_REDIRECT_URI
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        accountName: response.data.guild?.name || 'Discord Server',
        accountEmail: response.data.guild?.id || 'discord-guild',
        scopes: response.data.scope?.split(' ') || [],
        config: { guild: response.data.guild }
      };
    } catch (err) {
      logger.error('Discord OAuth token exchange failed', err);
      throw this.createError('AUTH_EXPIRED', 'Discord token exchange error: ' + err.message);
    }
  }

  async testConnection(integrationDoc) {
    if (!integrationDoc || integrationDoc.status !== 'connected') {
      throw this.createError('INTEGRATION_NOT_CONNECTED', 'Discord integration is not connected.');
    }
    return {
      connected: true,
      bot: integrationDoc.accountName || 'Agentflow Discord Bot',
      lastTested: new Date()
    };
  }

  async execute(action, params = {}, credentials = {}) {
    const webhookUrl = credentials.config?.webhookUrl || params.webhookUrl;
    const botToken = credentials.accessToken || env.DISCORD_BOT_TOKEN;

    switch (action) {
      case 'post_message':
      case 'discord_notify': {
        const { channel, message, embeds, content } = params;
        const bodyContent = message || content || 'Agentflow_AI Notification';

        if (webhookUrl) {
          try {
            await axios.post(webhookUrl, {
              content: bodyContent,
              embeds: embeds || [
                {
                  title: 'Agentflow_AI Event',
                  description: bodyContent,
                  color: 0x6366f1,
                  timestamp: new Date().toISOString()
                }
              ]
            });
            return { sent: true, provider: 'discord', status: 'delivered_webhook' };
          } catch (err) {
            throw this.createError('API_FAILURE', `Discord Webhook error: ${err.message}`);
          }
        }

        if (botToken && !botToken.startsWith('mock_') && channel) {
          try {
            const res = await axios.post(
              `https://discord.com/api/v10/channels/${channel}/messages`,
              {
                content: bodyContent,
                embeds: embeds || undefined
              },
              { headers: { Authorization: `Bot ${botToken}` } }
            );
            return { sent: true, messageId: res.data.id, channelId: channel };
          } catch (err) {
            throw this.createError('API_FAILURE', `Discord API error: ${err.message}`);
          }
        }

        // Simulated output
        return {
          sent: true,
          provider: 'discord',
          channel: channel || '#ops-alerts',
          message: bodyContent,
          timestamp: new Date().toISOString()
        };
      }

      default:
        throw this.createError('INVALID_ACTION', `Action "${action}" is not supported by Discord integration.`);
    }
  }
}

module.exports = new DiscordIntegration();
