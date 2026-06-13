import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { users, meta } = await userService.getAllUsers(req);
  res.status(200).json(ApiResponse.ok('Users fetched', users, meta));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);
  res.status(200).json(ApiResponse.ok('User fetched', user));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body);
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
