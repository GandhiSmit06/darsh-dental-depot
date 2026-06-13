import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
  });

  // Operational (ApiError) — known, expected errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      ...ApiResponse.error(err.message),
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(ApiResponse.error(errors[0] || 'Validation error'));
  }

  // Mongoose Duplicate Key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    return res.status(409).json(ApiResponse.error(`${field} already exists.`));
  }

  // Mongoose Cast Error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json(ApiResponse.error(`Invalid ${err.path}: ${err.value}`));
  }

  // JWT errors handled by auth middleware (they throw ApiError already)

  // Unknown/unhandled error — don't leak details in production
  const message =
    env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.';

  return res.status(500).json(ApiResponse.error(message));
};
