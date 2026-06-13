import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Types } from 'mongoose';
import { UserRole } from '../interfaces/user.interface';

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
};

export const signEmailVerifyToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ id: userId.toString() }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_EMAIL_VERIFY_EXPIRES_IN,
  } as SignOptions);
};

export const signPasswordResetToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ id: userId.toString() }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_RESET_PASSWORD_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

export const verifyGenericToken = (token: string): { id: string } => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string };
};
