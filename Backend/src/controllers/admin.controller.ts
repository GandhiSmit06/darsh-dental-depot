import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import dayjs from 'dayjs';

export const getDashboardData = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const startOfMonth = dayjs().startOf('month').toDate();
  const startOfToday = dayjs().startOf('day').toDate();
  const startOfWeek = dayjs().startOf('week').toDate();

  // Get recent activity: combine recent orders and recent users
  const [
    recentOrders,
    recentUsers,
    monthlySales,
    totalUsers,
    totalOrders,
    totalRevenue,
    lowStockCount,
  ] = await Promise.all([
    // Get last 5 orders
    Order.find({ paymentStatus: 'paid' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'fullName email')
      .lean(),
    // Get last 5 users (signed up)
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email role createdAt')
      .lean(),
    // Get sales for the current month (daily)
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Total users
    User.countDocuments({ isActive: true }),
    // Total orders
    Order.countDocuments({ paymentStatus: 'paid' }),
    // Total revenue (all time)
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]).then((r) => r[0]?.total || 0),
    // Low stock count
    Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      status: { $ne: 'inactive' },
    }),
  ]);

  // Format recent orders for activity feed
  const orderActivities = recentOrders.map((order: any) => ({
    id: order._id.toString(),
    type: 'order',
    message: `New order #${order.orderId ? order.orderId : order._id} placed`,
    time: order.createdAt,
    user: {
      name: order.customerId?.fullName || 'Customer',
      email: order.customerId?.email || '',
    },
  }));

  // Format recent signups for activity feed
  const userActivities = recentUsers.map((user: any) => ({
    id: user._id.toString(),
    type: 'user',
    message: `New user registered: ${user.fullName}`,
    time: user.createdAt,
    user: {
      name: user.fullName,
      email: user.email,
    },
  }));

  // Combine and sort by date descending
  const activityFeed = [...orderActivities, ...userActivities]
    .sort((a: any, b: any) => b.time.getTime() - a.time.getTime())
    .slice(0, 10); // Keep only latest 10

  // Format monthly sales for chart (ensure all days of month are present)
  const currentMonthDays = Array.from({ length: dayjs().daysInMonth() }, (_, i) => i + 1);
  const salesMap = new Map(monthlySales.map((item: any) => [item._id, item.revenue]));
  const formattedMonthlySales = currentMonthDays.map((day) => {
    const date = dayjs().month(dayjs().month()).date(day).format('YYYY-MM-DD');
    return {
      day: dayjs(date).format('DD'),
      revenue: salesMap.get(date) || 0,
    };
  });

  res.status(200).json(
    ApiResponse.ok('Dashboard data fetched', {
      activityFeed,
      recentOrders: recentOrders.map((order: any) => ({
        id: order._id.toString(),
        orderId: order.orderId || order._id.toString(),
        customerName: order.customerId?.fullName || 'Customer',
        customerEmail: order.customerId?.email || '',
        total: order.totalPrice,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        date: order.createdAt,
      })),
      monthlySales: formattedMonthlySales,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        lowStockCount,
      },
    })
  );
});

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(ApiResponse.ok('Users fetched successfully', users));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Prevent admin from deleting their own account
  if (req.user!._id.toString() === id) {
    res.status(400).json(ApiResponse.error('You cannot delete your own admin account'));
    return;
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    res.status(404).json(ApiResponse.error('User not found'));
    return;
  }

  res.status(200).json(ApiResponse.ok('User deleted successfully', { id }));
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive, isVerified } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json(ApiResponse.error('User not found'));
    return;
  }

  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (typeof isVerified === 'boolean') user.isVerified = isVerified;

  await user.save();

  res.status(200).json(ApiResponse.ok('User updated successfully', user));
});