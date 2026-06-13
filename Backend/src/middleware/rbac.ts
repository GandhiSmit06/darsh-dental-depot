import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../interfaces/user.interface';
import { ApiError } from '../utils/ApiError';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource.`,
        ),
      );
    }
    next();
  };
};
