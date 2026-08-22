import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let retries = 0;
const MAX_RETRIES = 5;

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    retries = 0;
  } catch (error) {
    retries++;
    logger.error(`MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${(error as Error).message}`);
    if (retries < MAX_RETRIES) {
      logger.info(`Retrying in 5 seconds...`);
      setTimeout(connectDB, 5000);
    } else {
      logger.error('Max retries reached. Exiting.');
      process.exit(1);
    }
  }
};

