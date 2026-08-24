const { Queue, Worker } = require('bullmq');
const { getRedisClient, isRedisConnected } = require('../config/redis');
const inMemoryQueue = require('./inMemoryQueue');
const orchestrator = require('../agents/orchestrator');
const logger = require('../utils/logger');

let bullQueue = null;
let bullWorker = null;

const initExecutionQueue = () => {
  const redis = getRedisClient();

  if (redis && isRedisConnected()) {
    try {
      bullQueue = new Queue('workflow-executions', { connection: redis });
      bullWorker = new Worker(
        'workflow-executions',
        async (job) => {
          logger.info(`[BullMQ] Starting execution job ${job.id} for execution ${job.data.executionId}`);
          await orchestrator.runWorkflow(job.data.executionId, job.data.inputPayload);
        },
        { connection: redis, concurrency: 5 }
      );

      bullWorker.on('completed', (job) => {
        logger.info(`[BullMQ] Completed job ${job.id}`);
      });

      bullWorker.on('failed', (job, err) => {
        logger.error(`[BullMQ] Failed job ${job.id}:`, err);
      });

      logger.info('BullMQ Execution Queue initialized successfully on Redis.');
      return;
    } catch (err) {
      logger.warn(`BullMQ initialization error (${err.message}). Using in-memory queue fallback.`);
    }
  }

  // Setup In-Memory processor fallback
  inMemoryQueue.setProcessor(async (job) => {
    logger.info(`[In-Memory Queue] Running execution ${job.data.executionId}`);
    await orchestrator.runWorkflow(job.data.executionId, job.data.inputPayload);
  });
  logger.info('In-Memory Execution Queue initialized as active processor.');
};

const dispatchExecution = async (executionId, inputPayload = {}) => {
  if (bullQueue && isRedisConnected()) {
    try {
      const job = await bullQueue.add('run-workflow', { executionId, inputPayload }, {
        attempts: 1,
        removeOnComplete: true
      });
      return { queueType: 'bullmq', jobId: job.id };
    } catch (err) {
      logger.warn(`BullMQ add failed (${err.message}). Falling back to in-memory queue.`);
    }
  }

  const job = await inMemoryQueue.add('run-workflow', { executionId, inputPayload });
  return { queueType: 'in-memory', jobId: job.id };
};

module.exports = { initExecutionQueue, dispatchExecution };
