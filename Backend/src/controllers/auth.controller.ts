import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.created(result.message));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.login(email, password);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.status(200).json(
    ApiResponse.ok('Login successful', { user, accessToken, refreshToken }),
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!._id.toString());
  res.clearCookie('refreshToken');
  res.status(200).json(ApiResponse.ok('Logged out successfully'));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { accessToken, refreshToken: newRefresh, user } = await authService.refreshTokens(token as string);

  res.cookie('refreshToken', newRefresh, COOKIE_OPTIONS);
  res.status(200).json(ApiResponse.ok('Tokens refreshed', { user, accessToken }));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.params.token as string);
  res.status(200).json(ApiResponse.ok('Email verified successfully. You can now log in.'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res.status(200).json(ApiResponse.ok('If this email exists, a reset link has been sent.'));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token as string, req.body.password);
  res.status(200).json(ApiResponse.ok('Password reset successfully. Please log in.'));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(ApiResponse.ok('Profile fetched', req.user));
});
