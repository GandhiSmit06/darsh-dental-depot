import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { redisClient } from './config/redis';
import { startLowStockAlertJob } from './jobs/lowStockAlert.job';
import { startExpiryAlertJob } from './jobs/expiryAlert.job';
import { logger } from './utils/logger';
import fs from 'fs';
import path from 'path';

// Ensure log directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (non-fatal)
    await redisClient.connect();

    // Start background jobs
    startLowStockAlertJob();
    startExpiryAlertJob();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🦷 Darsh Dental Depot API running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📖 API Docs: http://localhost:${env.PORT}/api-docs`);
      logger.info(`❤️  Health:   http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
    });

    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${(error as Error).message}`);
    process.exit(1);
  }
};

start();
