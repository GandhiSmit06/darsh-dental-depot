import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiResponse } from '../utils/ApiResponse';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX || 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: ApiResponse.error('Too many requests. Please try again later.'),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX || 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: ApiResponse.error('Too many authentication attempts. Please wait 15 minutes before trying again.'),
});

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.CHAT_RATE_LIMIT_MAX || 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: ApiResponse.error('Too many chatbot queries. Please slow down.'),
});

