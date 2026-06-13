import { Notification } from '../models/Notification';
import { getPagination, buildMeta } from '../utils/pagination';
import { Request } from 'express';

export class NotificationService {
  async getUserNotifications(userId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);
    const filter: Record<string, unknown> = { userId };
    if (req.query.unread === 'true') filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return { notifications, meta: buildMeta(total, page, limit), unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
  ) {
    return Notification.create({ userId, type, title, message, link });
  }
}

export const notificationService = new NotificationService();
