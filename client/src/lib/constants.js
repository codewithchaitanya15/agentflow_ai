export const NODE_CATEGORIES = [
  { id: 'trigger', label: 'Triggers', color: '#6366f1' },
  { id: 'ai', label: 'AI Agents & Models', color: '#c084fc' },
  { id: 'action', label: 'Actions & Integrations', color: '#06b6d4' },
  { id: 'logic', label: 'Logic & Flow Control', color: '#10b981' }
];

export const NODE_CATALOG = [
  // 1. Triggers
  {
    category: 'trigger',
    nodeType: 'email_trigger',
    label: 'Gmail New Email',
    icon: 'Mail',
    description: 'Triggers when a new email matches criteria in Gmail',
    defaultConfig: {
      folder: 'INBOX',
      filterSubject: '',
      query: 'is:unread category:primary',
      checkIntervalSec: 60
    },
    inputs: [],
    outputs: ['out']
  },
  {
    category: 'trigger',
    nodeType: 'webhook_trigger',
    label: 'Incoming Webhook',
    icon: 'Webhook',
    description: 'Triggers on incoming HTTP POST payload',
    defaultConfig: {
      endpoint: '/webhooks/incoming',
      authRequired: false
    },
    inputs: [],
    outputs: ['out']
  },
  {
    category: 'trigger',
    nodeType: 'cron_trigger',
    label: 'Schedule (Cron)',
    icon: 'Clock',
    description: 'Triggers on a recurring cron interval or fixed schedule',
    defaultConfig: {
      cronExpression: '0 9 * * 1-5',
      timezone: 'UTC'
    },
    inputs: [],
    outputs: ['out']
  },
  {
    category: 'trigger',
    nodeType: 'manual_trigger',
    label: 'Manual / API Trigger',
    icon: 'Cpu',
    description: 'Triggered manually by an operator or external API trigger',
    defaultConfig: {
      payloadSchema: '{}'
    },
    inputs: [],
    outputs: ['out']
  },

  // 2. AI Nodes
  {
    category: 'ai',
    nodeType: 'ai_prompt',
    label: 'AI Reasoning Agent',
    icon: 'Brain',
    description: 'Executes LLM reasoning with custom prompt and parameters',
    defaultConfig: {
      prompt: 'Summarize the received payload and highlight critical action items: {{input}}',
      systemPrompt: 'You are an intelligent operations automation agent.',
      temperature: 0.3,
      model: 'anthropic/claude-3.5-sonnet'
    },
    inputs: ['in'],
    outputs: ['out']
  },
  {
    category: 'ai',
    nodeType: 'ai_classifier',
    label: 'AI Intent / Classifier',
    icon: 'Brain',
    description: 'Classifies input text into categorical classes with confidence score',
    defaultConfig: {
      classes: ['URGENT_ESCALATION', 'NORMAL_INQUIRY', 'BILLING_QUESTION', 'SPAM'],
      confidenceThreshold: 0.85
    },
    inputs: ['in'],
    outputs: ['out']
  },
  {
    category: 'ai',
    nodeType: 'ai_extractor',
    label: 'AI Data Extractor',
    icon: 'Brain',
    description: 'Extracts structured JSON entities from unstructured text',
    defaultConfig: {
      outputSchema: '{\n  "invoiceNumber": "string",\n  "vendorName": "string",\n  "totalAmount": "number",\n  "dueDate": "string"\n}'
    },
    inputs: ['in'],
    outputs: ['out']
  },

  // 3. Actions & Integrations
  {
    category: 'action',
    nodeType: 'gmail_send',
    label: 'Send Gmail Email',
    icon: 'Send',
    description: 'Sends an email via connected Gmail account',
    defaultConfig: {
      to: 'recipient@example.com',
      subject: 'Update from Agentflow_AI',
      body: 'Hello,\n\nThe automation has completed: {{result}}'
    },
    inputs: ['in'],
    outputs: ['out']
  },
  {
    category: 'action',
    nodeType: 'slack_notify',
    label: 'Slack Notification',
    icon: 'MessageSquare',
    description: 'Posts a message to a Slack channel or webhook',
    defaultConfig: {
      channel: '#operations-alerts',
      message: '🚨 *Agentflow Event*: {{node_1.output.summary}}'
    },
    inputs: ['in'],
    outputs: ['out']
  },
  {
    category: 'action',
    nodeType: 'discord_notify',
    label: 'Discord Channel Alert',
    icon: 'Bot',
    description: 'Sends rich embed notification to Discord channel',
    defaultConfig: {
      channel: '#alerts-feed',
      message: '🔔 **Agentflow Notice**: {{node_1.output.result}}'
    },
    inputs: ['in'],
    outputs: ['out']
  },
  {
    category: 'action',
    nodeType: 'sheets_append',
    label: 'Append to Google Sheet',
    icon: 'FileSpreadsheet',
    description: 'Appends a new row of data to a Google Spreadsheet',
    defaultConfig: {
      spreadsheetId: 'corporate-operations-sheet',
      sheetName: 'Sheet1',
      columns: ['timestamp', 'sender', 'status', 'output']
    },
    inputs: ['in'],
    outputs: ['out']
  },

  // 4. Logic & Flow Control
  {
    category: 'logic',
    nodeType: 'condition_branch',
    label: 'Condition / Filter',
    icon: 'Split',
    description: 'Branches or filters flow based on field comparisons',
    defaultConfig: {
      conditionField: 'totalAmount',
      operator: 'greater_than',
      value: '1000'
    },
    inputs: ['in'],
    outputs: ['out']
  },
  {
    category: 'logic',
    nodeType: 'transformer',
    label: 'Data Transformer',
    icon: 'Cpu',
    description: 'Restructures or maps JSON data before the next step',
    defaultConfig: {
      mapping: '{\n  "formattedTotal": "{{totalAmount}} USD",\n  "status": "APPROVED"\n}'
    },
    inputs: ['in'],
    outputs: ['out']
  },
  {
    category: 'logic',
    nodeType: 'delay',
    label: 'Delay / Wait',
    icon: 'Clock',
    description: 'Pauses execution for a configured number of seconds',
    defaultConfig: {
      seconds: 3
    },
    inputs: ['in'],
    outputs: ['out']
  }
];
