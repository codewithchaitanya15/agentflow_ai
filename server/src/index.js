const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initRedis } = require('./config/redis');
const { initExecutionQueue } = require('./queues/executionQueue');
const logger = require('./utils/logger');
const seedInitialData = require('./utils/seedData');

// Middlewares
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// HTTP Security & Optimization
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Real-Time WebSockets
const io = initSocket(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Health check endpoint with uptime & environment telemetry
const serverStartTime = Date.now();
app.get('/api/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  res.status(200).json({
    status: 'healthy',
    service: 'Agentflow_AI API Engine',
    version: '1.0.0',
    uptimeSeconds,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    aiProviders: {
      openRouter: !!env.OPENROUTER_API_KEY,
      gemini: !!env.GEMINI_API_KEY,
      deterministicFallback: true
    },
    integrations: {
      gmail: !!env.GOOGLE_CLIENT_ID,
      slack: !!env.SLACK_CLIENT_ID,
      discord: !!env.DISCORD_CLIENT_ID,
      googleSheets: !!env.GOOGLE_CLIENT_ID
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Bootstrap Server
const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Seed default users and workflows
    await seedInitialData();

    // 3. Initialize Redis and BullMQ / In-Memory Queue
    initRedis();
    initExecutionQueue();

    // 4. Start HTTP Server
    server.listen(env.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 Agentflow_AI Server running on port ${env.PORT}`);
      logger.info(`🌐 Environment: ${env.NODE_ENV}`);
      logger.info(`📡 WebSocket Server ready on port ${env.PORT}`);
      logger.info(`🔑 Demo Account: operator@agentflow.ai / OperatorPass123!`);
      logger.info(`🛡️ Admin Account: admin@agentflow.ai / AdminPass123!`);
      logger.info(`=======================================================`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start application
if (require.main === module) {
  startServer();
}

module.exports = { app, server };
