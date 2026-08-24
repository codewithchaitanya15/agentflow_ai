const EventEmitter = require('events');
const logger = require('../utils/logger');

class InMemoryQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = [];
    this.isProcessing = false;
  }

  async add(name, data, opts = {}) {
    const job = {
      id: 'mem_job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name,
      data,
      opts,
      timestamp: Date.now()
    };

    this.jobs.push(job);
    logger.debug(`[InMemoryQueue] Added job ${job.id} (${name})`);

    // Process asynchronously without blocking
    setImmediate(() => this.processNext());
    return job;
  }

  setProcessor(processorFn) {
    this.processorFn = processorFn;
  }

  async processNext() {
    if (this.isProcessing || this.jobs.length === 0 || !this.processorFn) {
      return;
    }

    this.isProcessing = true;
    const job = this.jobs.shift();

    try {
      logger.debug(`[InMemoryQueue] Processing job ${job.id} (${job.name})`);
      await this.processorFn(job);
      this.emit('completed', job);
    } catch (err) {
      logger.error(`[InMemoryQueue] Job ${job.id} failed:`, err);
      this.emit('failed', job, err);
    } finally {
      this.isProcessing = false;
      if (this.jobs.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }
}

module.exports = new InMemoryQueue();
