import { Request, Response, NextFunction } from 'express';
import { sanitizeObject } from '../utils/sanitize';

/**
 * Global input sanitization middleware:
 * Deeply sanitizes request body, query parameters, and route parameters
 * to protect against stored and reflected Cross-Site Scripting (XSS)
 * as well as Prototype Pollution.
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};
