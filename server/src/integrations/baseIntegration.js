/**
 * Base Integration Class
 * Standard interface for all third-party integrations (Gmail, Slack, Discord, Google Sheets, etc.)
 */
class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  getAuthUrl(state) {
    throw new Error(`getAuthUrl not implemented for ${this.providerName}`);
  }

  async handleCallback(code, state) {
    throw new Error(`handleCallback not implemented for ${this.providerName}`);
  }

  async testConnection(integrationDoc) {
    throw new Error(`testConnection not implemented for ${this.providerName}`);
  }

  async execute(action, params, credentials) {
    throw new Error(`execute not implemented for ${this.providerName}`);
  }

  createError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.provider = this.providerName;
    error.details = details;
    return error;
  }
}

module.exports = BaseIntegration;
