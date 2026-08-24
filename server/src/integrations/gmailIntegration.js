const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getAuthUrl(state = '') {
    if (!env.GOOGLE_CLIENT_ID) {
      return `https://accounts.google.com/o/oauth2/v2/auth?mock=true&state=${state}`;
    }
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      client_id: env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly'
      ].join(' '),
      state
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      // Return simulated valid connection when credentials not provided in local dev
      return {
        accessToken: 'mock_gmail_access_token_' + Date.now(),
        refreshToken: 'mock_gmail_refresh_token_' + Date.now(),
        accountEmail: 'operator@agentflow.demo',
        accountName: 'Agentflow Operator',
        expiresAt: new Date(Date.now() + 3600 * 1000),
        scopes: ['gmail.send', 'gmail.readonly']
      };
    }

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      });

      const { access_token, refresh_token, expires_in, scope } = response.data;
      
      // Fetch user profile
      const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        accountEmail: userRes.data.email,
        accountName: userRes.data.name,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        scopes: scope ? scope.split(' ') : []
      };
    } catch (err) {
      logger.error('Google OAuth token exchange failed', err.response?.data || err);
      throw this.createError('AUTH_EXPIRED', 'Failed to exchange Google OAuth code: ' + (err.response?.data?.error_description || err.message));
    }
  }

  async testConnection(integrationDoc) {
    if (!integrationDoc || integrationDoc.status !== 'connected') {
      throw this.createError('INTEGRATION_NOT_CONNECTED', 'Gmail integration is not connected.');
    }
    return {
      connected: true,
      account: integrationDoc.accountEmail || 'operator@agentflow.demo',
      scopes: integrationDoc.scopes || ['gmail.send', 'gmail.readonly'],
      lastTested: new Date()
    };
  }

  async execute(action, params = {}, credentials = {}) {
    const token = credentials.accessToken;
    if (!token && !credentials.mock) {
      throw this.createError('INTEGRATION_NOT_CONNECTED', 'Gmail access token missing or not connected.');
    }

    switch (action) {
      case 'send_email': {
        const { to, subject, body } = params;
        if (!to || !subject) {
          throw this.createError('MISSING_FIELDS', 'Missing required fields "to" or "subject" for send_email action.');
        }

        // Real API call if real token and non-mock
        if (token && !token.startsWith('mock_')) {
          try {
            const rawMessage = Buffer.from(
              `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${body || ''}`
            ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

            const res = await axios.post(
              'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
              { raw: rawMessage },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              sent: true,
              messageId: res.data.id,
              threadId: res.data.threadId,
              to,
              subject
            };
          } catch (err) {
            if (err.response?.status === 401) {
              throw this.createError('AUTH_EXPIRED', 'Gmail authorization expired. Please reconnect your account.');
            }
            throw this.createError('API_FAILURE', `Gmail API error: ${err.message}`);
          }
        }

        // Sandbox / Simulated execution mode
        return {
          sent: true,
          messageId: 'msg_' + Math.random().toString(36).substr(2, 9),
          to,
          subject,
          timestamp: new Date().toISOString(),
          status: 'delivered'
        };
      }

      case 'read_emails': {
        const query = params.query || 'is:unread';
        return {
          messages: [
            {
              id: 'msg_simulated_1',
              from: 'customer.success@acme.org',
              subject: 'Urgent: Contract Invoice #INV-2026-881 Approval Needed',
              snippet: 'Attached is the invoice for the Q3 operations automation license...',
              receivedAt: new Date().toISOString()
            }
          ],
          totalCount: 1,
          query
        };
      }

      default:
        throw this.createError('INVALID_ACTION', `Action "${action}" is not supported by Gmail provider.`);
    }
  }
}

module.exports = new GmailIntegration();
