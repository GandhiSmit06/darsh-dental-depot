import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers and forwards errors to next()
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
