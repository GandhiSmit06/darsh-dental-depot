import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

const redisConfig: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    if (times > 5) {
      logger.warn('Redis connection failed after 5 retries — caching disabled');
      return null;
    }
    return Math.min(times * 500, 2000);
  },
  lazyConnect: true,
};

class RedisClient {
  private client: Redis | null = null;
  private connected = false;

  async connect(): Promise<void> {
    try {
      this.client = new Redis(redisConfig);
      await this.client.connect();
      this.connected = true;
      logger.info('Redis connected');

      this.client.on('error', (err) => {
        logger.error(`Redis error: ${err.message}`);
        this.connected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });
    } catch (err) {
      logger.warn('Redis unavailable — running without cache');
      this.connected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.connected || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttl = env.REDIS_TTL): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      await this.client.setex(key, ttl, value);
    } catch {
      // silently fail
    }
  }

  async del(key: string): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      await this.client.del(key);
    } catch {
      // silently fail
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length) await this.client.del(...keys);
    } catch {
      // silently fail
    }
  }
}

export const redisClient = new RedisClient();
