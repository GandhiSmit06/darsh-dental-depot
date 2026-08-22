import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../helpers/jwt.helper';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please log in.');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err: any) {
      throw ApiError.unauthorized('Session expired or invalid token. Please log in again.');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user) {
      throw ApiError.unauthorized('User no longer exists.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been suspended.');
    }

    req.user = user;
    next();
  },
);
