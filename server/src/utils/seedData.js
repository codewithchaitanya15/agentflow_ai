const User = require('../models/User');
const Workflow = require('../models/Workflow');
const Integration = require('../models/Integration');
const Notification = require('../models/Notification');
const cryptoService = require('../services/cryptoService');
const logger = require('./logger');

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      logger.info('Database already contains data, skipping seed.');
      return;
    }

    logger.info('Seeding initial demonstration users, workflows, and integrations...');

    // 1. Create Default Users
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@agentflow.ai',
      password: 'AdminPass123!',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    const operator = await User.create({
      name: 'Alex Rivera (Lead Operator)',
      email: 'operator@agentflow.ai',
      password: 'OperatorPass123!',
      role: 'operator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    // 2. Create Sample Integrations for operator
    const mockIntegrations = [
      {
        owner: operator._id,
        provider: 'gmail',
        status: 'connected',
        accountEmail: 'operator@agentflow.ai',
        accountName: 'Agentflow Gmail Connector',
        scopes: ['gmail.send', 'gmail.readonly'],
        encryptedAccessToken: cryptoService.encrypt('mock_gmail_access_token'),
        encryptedRefreshToken: cryptoService.encrypt('mock_gmail_refresh_token'),
        lastTestedAt: new Date()
      },
      {
        owner: operator._id,
        provider: 'slack',
        status: 'connected',
        accountName: 'Agentflow Ops Slack Workspace',
        accountEmail: 'bot@slack.agentflow.ai',
        scopes: ['chat:write', 'incoming-webhook'],
        encryptedAccessToken: cryptoService.encrypt('mock_slack_bot_token'),
        config: { defaultChannel: '#operations-alerts' },
        lastTestedAt: new Date()
      },
      {
        owner: operator._id,
        provider: 'discord',
        status: 'connected',
        accountName: 'Operations Incident Guild',
        accountEmail: 'discord-guild-ops',
        scopes: ['bot'],
        encryptedAccessToken: cryptoService.encrypt('mock_discord_bot_token'),
        config: { defaultChannel: '#incidents-feed' },
        lastTestedAt: new Date()
      },
      {
        owner: operator._id,
        provider: 'google-sheets',
        status: 'connected',
        accountEmail: 'sheets@agentflow.ai',
        accountName: 'Corporate Operations Ledger',
        scopes: ['spreadsheets'],
        encryptedAccessToken: cryptoService.encrypt('mock_sheets_token'),
        lastTestedAt: new Date()
      }
    ];

    await Integration.insertMany(mockIntegrations);

    // 3. Create Sample Workflows for operator
    const sampleWorkflows = [
      {
        name: 'AI Lead Sentiment & Slack Escalation',
        description: 'Monitors incoming customer inquiries, evaluates urgency with AI, logs to Google Sheets, and sends priority alerts to Slack.',
        owner: operator._id,
        status: 'active',
        tags: ['Customer Support', 'AI Triage', 'Slack', 'Gmail'],
        version: 2,
        triggerConfig: {
          type: 'email',
          settings: { folder: 'INBOX', filter: 'is:unread' }
        },
        nodes: [
          {
            id: 'node_1',
            type: 'customNode',
            position: { x: 80, y: 180 },
            data: {
              label: 'Gmail New Inquiry',
              category: 'trigger',
              nodeType: 'email_trigger',
              icon: 'Mail',
              config: { folder: 'INBOX', checkIntervalSec: 30 },
              inputs: [],
              outputs: ['out']
            }
          },
          {
            id: 'node_2',
            type: 'customNode',
            position: { x: 380, y: 180 },
            data: {
              label: 'AI Sentiment & Urgency Classifier',
              category: 'ai',
              nodeType: 'ai_classifier',
              icon: 'Brain',
              config: {
                classes: ['CRITICAL_ESCALATION', 'STANDARD_SUPPORT', 'BILLING_INQUIRY', 'FEEDBACK'],
                confidenceThreshold: 0.85
              },
              inputs: ['in'],
              outputs: ['out']
            }
          },
          {
            id: 'node_3',
            type: 'customNode',
            position: { x: 680, y: 180 },
            data: {
              label: 'Append to Support Ledger',
              category: 'action',
              nodeType: 'sheets_append',
              icon: 'FileSpreadsheet',
              config: {
                spreadsheetId: 'customer-support-ledger-2026',
                sheetName: 'Inquiries',
                columns: ['sender', 'subject', 'urgency', 'timestamp']
              },
              inputs: ['in'],
              outputs: ['out']
            }
          },
          {
            id: 'node_4',
            type: 'customNode',
            position: { x: 980, y: 180 },
            data: {
              label: 'Slack Escalation Alert',
              category: 'action',
              nodeType: 'slack_notify',
              icon: 'MessageSquare',
              config: {
                channel: '#operations-alerts',
                message: '🚨 *New Inquiry Processed*: {{node_1.output.payload.from}}\nClassification: *{{node_2.output.classification}}* (Confidence: {{node_2.output.confidence}})'
              },
              inputs: ['in'],
              outputs: []
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', sourceHandle: 'out', targetHandle: 'in', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
          { id: 'e2-3', source: 'node_2', target: 'node_3', sourceHandle: 'out', targetHandle: 'in', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
          { id: 'e3-4', source: 'node_3', target: 'node_4', sourceHandle: 'out', targetHandle: 'in', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }
        ]
      },
      {
        name: 'AI Invoice Extractor to Google Sheets',
        description: 'Extracts invoice amounts, line items, and vendor info, verifies amounts, logs into Google Sheets, and notifies the team.',
        owner: operator._id,
        status: 'active',
        tags: ['Finance', 'Invoice', 'AI Extraction', 'Google Sheets'],
        version: 1,
        triggerConfig: {
          type: 'webhook',
          settings: { endpoint: '/webhooks/invoices' }
        },
        nodes: [
          {
            id: 'node_1',
            type: 'customNode',
            position: { x: 80, y: 180 },
            data: {
              label: 'Invoice Webhook Ingestion',
              category: 'trigger',
              nodeType: 'webhook_trigger',
              icon: 'Webhook',
              config: { event: 'invoice.uploaded' },
              inputs: [],
              outputs: ['out']
            }
          },
          {
            id: 'node_2',
            type: 'customNode',
            position: { x: 380, y: 180 },
            data: {
              label: 'AI Document Extractor',
              category: 'ai',
              nodeType: 'ai_extractor',
              icon: 'Brain',
              config: {
                outputSchema: '{ "invoiceNumber": "string", "vendorName": "string", "totalAmount": "number", "dueDate": "string" }'
              },
              inputs: ['in'],
              outputs: ['out']
            }
          },
          {
            id: 'node_3',
            type: 'customNode',
            position: { x: 680, y: 180 },
            data: {
              label: 'Record in Finance Sheet',
              category: 'action',
              nodeType: 'sheets_append',
              icon: 'FileSpreadsheet',
              config: {
                spreadsheetId: 'corporate-finance-sheet-2026',
                sheetName: 'AP_Invoices'
              },
              inputs: ['in'],
              outputs: ['out']
            }
          },
          {
            id: 'node_4',
            type: 'customNode',
            position: { x: 980, y: 180 },
            data: {
              label: 'Discord Finance Channel',
              category: 'action',
              nodeType: 'discord_notify',
              icon: 'Bot',
              config: {
                channel: '#finance-feed',
                message: '💳 **Invoice Extracted**: ${{node_2.output.totalAmount}} for {{node_2.output.vendorName}} (Invoice #{{node_2.output.invoiceNumber}})'
              },
              inputs: ['in'],
              outputs: []
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', sourceHandle: 'out', targetHandle: 'in', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
          { id: 'e2-3', source: 'node_2', target: 'node_3', sourceHandle: 'out', targetHandle: 'in', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
          { id: 'e3-4', source: 'node_3', target: 'node_4', sourceHandle: 'out', targetHandle: 'in', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
        ]
      }
    ];

    await Workflow.insertMany(sampleWorkflows);

    // 4. Create Initial System Notification
    await Notification.create({
      owner: operator._id,
      type: 'info',
      title: 'Welcome to Agentflow_AI',
      message: 'Your AI Operations Platform is ready. Try generating workflows from natural language or triggering live agent executions!'
    });

    logger.info('Demo data seeded successfully!');
  } catch (err) {
    logger.error('Error during initial seeding:', err);
  }
};

module.exports = seedInitialData;
