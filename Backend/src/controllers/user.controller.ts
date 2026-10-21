import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { users, meta } = await userService.getAllUsers(req);
  res.status(200).json(ApiResponse.ok('Users fetched', users, meta));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const targetId = req.params.id as string;
  const isSelf = req.user?._id?.toString() === targetId;
  const isAdmin = req.user?.role === 'admin';

  if (!isSelf && !isAdmin) {
    throw ApiError.forbidden('Access denied. You can only view your own user profile.');
  }

  const user = await userService.getUserById(targetId);
  res.status(200).json(ApiResponse.ok('User fetched', user));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const targetId = req.params.id as string;
  const isSelf = req.user?._id?.toString() === targetId;
  const isAdmin = req.user?.role === 'admin';

  if (!isSelf && !isAdmin) {
    throw ApiError.forbidden('Access denied. You can only update your own user profile.');
  }

  // Prevent non-admin privilege escalation / tampering with status
  const updates = { ...req.body };
  if (!isAdmin) {
    delete updates.role;
    delete updates.isActive;
    delete updates.isVerified;
  }

  const user = await userService.updateUser(targetId, updates);
  res.status(200).json(ApiResponse.ok('User updated', user));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id as string);
  res.status(200).json(ApiResponse.ok('User deleted'));
});

export const exportUsers = asyncHandler(async (req: Request, res: Response) => {
  const csv = await userService.exportUsersCSV(req);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
  res.status(200).send(csv);
});
