import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.getUserNotifications(req.user!._id.toString(), req);
  res.status(200).json(ApiResponse.ok('Notifications fetched', result.notifications, {
    ...result.meta,
    unreadCount: result.unreadCount,
  }));
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(req.params.id as string, req.user!._id.toString());
  res.status(200).json(ApiResponse.ok('Notification marked as read', notification));
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!._id.toString());
  res.status(200).json(ApiResponse.ok('All notifications marked as read'));
});
