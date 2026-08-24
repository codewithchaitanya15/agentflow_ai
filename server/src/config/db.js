const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let mongodInstance = null;

const connectDB = async () => {
  try {
    // Attempt standard / Atlas connection first if MONGODB_URI is provided
    if (env.MONGODB_URI && env.USE_MEMORY_DB !== true) {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      logger.info(`MongoDB connected to external instance: ${env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')}`);
      return mongoose.connection;
    }
  } catch (err) {
    logger.warn(`External MongoDB connection failed (${err.message}). Falling back to MongoMemoryServer...`);
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const fs = require('fs');
    const dbDir = 'D:\\mongomem';
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbPath: dbDir
      }
    });
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    logger.info(`MongoDB connected to In-Memory Server at: ${uri}`);
    return mongoose.connection;
  } catch (err) {
    logger.error('Failed to connect to MongoMemoryServer fallback', err);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    logger.info('MongoDB disconnected.');
  } catch (err) {
    logger.error('Error disconnecting MongoDB', err);
  }
};

module.exports = { connectDB, disconnectDB };
