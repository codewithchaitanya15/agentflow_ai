const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class AiWorkflowService {
  constructor() {
    this.geminiClient = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
  }

  getSystemPrompt() {
    return `You are an expert AI Operations Workflow Architect for Agentflow_AI.
Given a natural language automation requirement, you design an optimal, executable visual workflow graph.

Output MUST be STRICT JSON with NO markdown fences, matching this structure:
{
  "name": "Workflow Name",
  "description": "Short description of what this workflow does",
  "triggerType": "manual" | "webhook" | "cron" | "email" | "event",
  "tags": ["AI", "Integration", ...],
  "nodes": [
    {
      "id": "node_1",
      "type": "customNode",
      "position": { "x": 100, "y": 150 },
      "data": {
        "label": "Node Label",
        "category": "trigger" | "action" | "ai" | "logic",
        "nodeType": "email_trigger" | "webhook_trigger" | "cron_trigger" | "gmail_send" | "slack_notify" | "discord_notify" | "sheets_append" | "ai_prompt" | "ai_classifier" | "ai_extractor" | "condition_branch" | "transformer" | "delay",
        "icon": "Mail" | "Webhook" | "Clock" | "Send" | "MessageSquare" | "Bot" | "FileSpreadsheet" | "Brain" | "Split" | "Cpu",
        "config": {
          // relevant config fields for this node type
        },
        "inputs": ["in"],
        "outputs": ["out"]
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "node_1",
      "target": "node_2",
      "sourceHandle": "out",
      "targetHandle": "in",
      "animated": true,
      "style": { "stroke": "#6366f1" }
    }
  ]
}

Layout rules:
- Arrange nodes in logical sequence from left to right (x starts at 100, increases by 320 for each step; y is centered around 200, branches offset by +- 160).
- Every non-trigger node must have incoming edges.
- Provide sensible realistic default configs for each node.`;
  }

  async generateWorkflow(prompt) {
    logger.info(`Generating workflow from prompt: "${prompt}"`);

    // Tier 1: OpenRouter
    if (env.OPENROUTER_API_KEY) {
      try {
        const response = await axios.post(
          `${env.OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: env.OPENROUTER_MODEL,
            messages: [
              { role: 'system', content: this.getSystemPrompt() },
              { role: 'user', content: `Create a workflow for: ${prompt}` }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://agentflow.ai',
              'X-Title': 'Agentflow_AI'
            },
            timeout: 20000
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = this.cleanAndParseJSON(content);
          if (this.validateGraphStructure(parsed)) {
            parsed.aiGenerated = true;
            parsed.generatorUsed = 'openrouter';
            return parsed;
          }
        }
      } catch (err) {
        logger.warn(`OpenRouter generation failed (${err.message}). Falling back to Gemini...`);
      }
    }

    // Tier 2: Google Gemini
    if (this.geminiClient) {
      try {
        const model = this.geminiClient.getGenerativeModel({
          model: env.GEMINI_MODEL,
          generationConfig: { responseMimeType: 'application/json' }
        });

        const result = await model.generateContent([
          this.getSystemPrompt(),
          `Create a workflow for: ${prompt}`
        ]);

        const text = result.response.text();
        const parsed = this.cleanAndParseJSON(text);
        if (this.validateGraphStructure(parsed)) {
          parsed.aiGenerated = true;
          parsed.generatorUsed = 'gemini';
          return parsed;
        }
      } catch (err) {
        logger.warn(`Gemini generation failed (${err.message}). Falling back to Deterministic Builder...`);
      }
    }

    // Tier 3: Deterministic Rule-Based Builder
    logger.info('Using deterministic rule-based workflow builder');
    return this.buildDeterministicWorkflow(prompt);
  }

  cleanAndParseJSON(raw) {
    try {
      let cleaned = raw.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(cleaned);
    } catch (err) {
      logger.error('Failed to parse AI output JSON:', err);
      return null;
    }
  }

  validateGraphStructure(graph) {
    if (!graph || !graph.name || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
      return false;
    }
    return true;
  }

  buildDeterministicWorkflow(rawPrompt) {
    const prompt = (rawPrompt || '').toLowerCase();
    const isEmail = prompt.includes('email') || prompt.includes('gmail') || prompt.includes('mail') || prompt.includes('inbox');
    const isSlack = prompt.includes('slack') || prompt.includes('channel');
    const isDiscord = prompt.includes('discord');
    const isSheets = prompt.includes('sheet') || prompt.includes('excel') || prompt.includes('table') || prompt.includes('spreadsheet') || prompt.includes('record');
    const isInvoice = prompt.includes('invoice') || prompt.includes('receipt') || prompt.includes('bill');
    const isSupport = prompt.includes('ticket') || prompt.includes('support') || prompt.includes('customer') || prompt.includes('feedback');
    const isCron = prompt.includes('daily') || prompt.includes('schedule') || prompt.includes('every') || prompt.includes('cron') || prompt.includes('hourly');

    let title = 'Automated AI Workflow';
    let description = `Automated multi-agent execution pipeline generated for: "${rawPrompt}"`;
    let triggerType = 'manual';
    let tags = ['AI Automation'];

    const nodes = [];
    const edges = [];
    let currentX = 80;
    const centerY = 200;
    const spacingX = 320;

    let nodeIndex = 1;
    const addNode = (category, nodeType, label, icon, config, customY = centerY) => {
      const id = `node_${nodeIndex++}`;
      nodes.push({
        id,
        type: 'customNode',
        position: { x: currentX, y: customY },
        data: {
          label,
          category,
          nodeType,
          icon,
          config: config || {},
          inputs: nodeIndex === 2 ? [] : ['in'],
          outputs: ['out']
        }
      });
      currentX += spacingX;
      return id;
    };

    const addEdge = (sourceId, targetId, label = '') => {
      edges.push({
        id: `e_${sourceId}_${targetId}`,
        source: sourceId,
        target: targetId,
        sourceHandle: 'out',
        targetHandle: 'in',
        animated: true,
        label,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      });
    };

    if (isInvoice) {
      title = 'AI Invoice Processor & Finance Router';
      description = 'Extracts invoice amounts, line items, and vendor info, logs into Google Sheets, and notifies the finance channel.';
      tags = ['Finance', 'AI Extraction', 'Google Sheets', 'Slack'];
      triggerType = isEmail ? 'email' : 'webhook';

      const tId = addNode('trigger', isEmail ? 'email_trigger' : 'webhook_trigger', isEmail ? 'Gmail New Invoice' : 'Invoice Webhook Hook', isEmail ? 'Mail' : 'Webhook', {
        filterSubject: 'Invoice',
        folder: 'INBOX'
      });

      const aiExtractId = addNode('ai', 'ai_extractor', 'AI Document Extractor', 'Brain', {
        prompt: 'Extract invoiceNumber, vendorName, totalAmount, currency, dueDate from document payload',
        outputSchema: '{ "invoiceNumber": "string", "vendorName": "string", "totalAmount": "number", "dueDate": "string" }'
      });
      addEdge(tId, aiExtractId);

      const validateId = addNode('logic', 'condition_branch', 'Validate Amount > $1000', 'Split', {
        conditionField: 'totalAmount',
        operator: 'greater_than',
        value: 1000
      });
      addEdge(aiExtractId, validateId);

      const sheetId = addNode('action', 'sheets_append', 'Append Invoice to Sheets', 'FileSpreadsheet', {
        spreadsheetId: 'finance-records-2026',
        sheetName: 'Invoices',
        columns: ['invoiceNumber', 'vendorName', 'totalAmount', 'dueDate']
      });
      addEdge(validateId, sheetId);

      const notifyId = addNode('action', isDiscord ? 'discord_notify' : 'slack_notify', isDiscord ? 'Discord Finance Alert' : 'Slack Finance Channel', isDiscord ? 'Bot' : 'MessageSquare', {
        channel: '#finance-approvals',
        message: 'New invoice processed: ${{node_2.output.totalAmount}} from {{node_2.output.vendorName}} (Invoice #{{node_2.output.invoiceNumber}})'
      });
      addEdge(sheetId, notifyId);

    } else if (isSupport || (isEmail && (isSlack || isDiscord))) {
      title = 'AI Email Triage & Incident Escalation';
      description = 'Monitors incoming emails, classifies sentiment & priority with AI, logs to Sheet, and routes high-priority alerts.';
      tags = ['Support', 'AI Classification', 'Gmail', isSlack ? 'Slack' : 'Discord'];
      triggerType = 'email';

      const tId = addNode('trigger', 'email_trigger', 'Gmail Inbox Listener', 'Mail', {
        query: 'is:unread category:primary',
        checkIntervalSec: 60
      });

      const aiClassId = addNode('ai', 'ai_classifier', 'AI Sentiment & Urgency Classifier', 'Brain', {
        classes: ['URGENT_ESCALATION', 'NORMAL_INQUIRY', 'BILLING_QUESTION', 'SPAM'],
        confidenceThreshold: 0.85
      });
      addEdge(tId, aiClassId);

      const sheetId = addNode('action', 'sheets_append', 'Log Support Ticket', 'FileSpreadsheet', {
        spreadsheetId: 'support-inbox-ledger',
        sheetName: 'Tickets',
        columns: ['from', 'subject', 'category', 'urgency', 'timestamp']
      });
      addEdge(aiClassId, sheetId);

      const notifyId = addNode('action', isDiscord ? 'discord_notify' : 'slack_notify', isDiscord ? 'Discord Support Alerts' : 'Slack Escalation Room', isDiscord ? 'Bot' : 'MessageSquare', {
        channel: isDiscord ? '#support-triage' : '#support-incidents',
        message: '🚨 Priority Email from {{node_1.output.from}}: {{node_1.output.subject}}\nClassification: {{node_2.output.classification}}'
      });
      addEdge(sheetId, notifyId);

    } else if (isCron) {
      title = 'Scheduled Ops Digest & Report';
      description = 'Triggers on a schedule, generates an AI summary report, and broadcasts to team channels.';
      tags = ['Scheduled', 'AI Digest', isSlack ? 'Slack' : 'Discord'];
      triggerType = 'cron';

      const tId = addNode('trigger', 'cron_trigger', 'Daily 9 AM Schedule', 'Clock', {
        cronExpression: '0 9 * * 1-5',
        timezone: 'America/New_York'
      });

      const aiId = addNode('ai', 'ai_prompt', 'AI Report Generator', 'Brain', {
        systemPrompt: 'You are an operations reporting assistant. Summarize the daily open items and SLA metrics.',
        temperature: 0.3
      });
      addEdge(tId, aiId);

      if (isSheets) {
        const sheetId = addNode('action', 'sheets_append', 'Record Daily Audit Row', 'FileSpreadsheet', {
          spreadsheetId: 'ops-daily-logs',
          sheetName: 'DailySummaries'
        });
        addEdge(aiId, sheetId);

        const notifyId = addNode('action', isDiscord ? 'discord_notify' : 'slack_notify', isDiscord ? 'Discord Daily Broadcast' : 'Slack Standup Broadcast', isDiscord ? 'Bot' : 'MessageSquare', {
          channel: '#daily-standup',
          message: '📊 **Daily Ops Summary**:\n{{node_2.output.summary}}'
        });
        addEdge(sheetId, notifyId);
      } else {
        const notifyId = addNode('action', isDiscord ? 'discord_notify' : 'slack_notify', isDiscord ? 'Discord Daily Broadcast' : 'Slack Standup Broadcast', isDiscord ? 'Bot' : 'MessageSquare', {
          channel: '#daily-standup',
          message: '📊 **Daily Ops Summary**:\n{{node_2.output.summary}}'
        });
        addEdge(aiId, notifyId);
      }

    } else {
      // General Smart Automation Pipeline
      title = rawPrompt.length > 50 ? rawPrompt.slice(0, 47) + '...' : rawPrompt;
      description = `AI-powered multi-step automation generated from: "${rawPrompt}"`;
      tags = ['AI Pipeline', 'Automation'];

      const tId = addNode('trigger', 'manual_trigger', 'Manual / API Trigger', 'Cpu', {
        payloadSchema: '{ "input": "string" }'
      });

      const aiId = addNode('ai', 'ai_prompt', 'AI Processing & Transformation', 'Brain', {
        prompt: `Process input according to instruction: ${rawPrompt}`,
        temperature: 0.4
      });
      addEdge(tId, aiId);

      if (isSheets) {
        const sId = addNode('action', 'sheets_append', 'Log Results in Google Sheets', 'FileSpreadsheet', {
          spreadsheetId: 'agentflow-master-log',
          sheetName: 'Automations'
        });
        addEdge(aiId, sId);

        const notifyId = addNode('action', isDiscord ? 'discord_notify' : 'slack_notify', isDiscord ? 'Discord Alert' : 'Slack Alert', isDiscord ? 'Bot' : 'MessageSquare', {
          channel: '#general',
          message: 'Automation step completed: {{node_2.output.result}}'
        });
        addEdge(sId, notifyId);
      } else {
        const notifyId = addNode('action', isDiscord ? 'discord_notify' : (isEmail ? 'gmail_send' : 'slack_notify'), isDiscord ? 'Discord Channel Post' : (isEmail ? 'Send Gmail Summary' : 'Slack Notification'), isDiscord ? 'Bot' : (isEmail ? 'Send' : 'MessageSquare'), {
          channel: '#automation-updates',
          message: 'Result from Agentflow_AI: {{node_2.output.result}}'
        });
        addEdge(aiId, notifyId);
      }
    }

    return {
      name: title,
      description,
      triggerType,
      tags,
      nodes,
      edges,
      aiGenerated: true,
      generatorUsed: 'deterministic-builder',
      prompt: rawPrompt
    };
  }
}

module.exports = new AiWorkflowService();
