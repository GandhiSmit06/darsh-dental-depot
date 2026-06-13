import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import dayjs from 'dayjs';

export class AnalyticsService {
  async getDashboardSummary() {
    const now = new Date();
    const startOfMonth = dayjs().startOf('month').toDate();
    const startOfToday = dayjs().startOf('day').toDate();

    const [
      totalRevenue,
      monthRevenue,
      totalOrders,
      ordersToday,
      totalUsers,
      totalProducts,
      lowStockCount,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]).then((r) => r[0]?.total || 0),

      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]).then((r) => r[0]?.total || 0),

      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, status: { $ne: 'inactive' } }),
    ]);

    return {
      totalRevenue,
      monthRevenue,
      totalOrders,
      ordersToday,
      totalUsers,
      totalProducts,
      lowStockCount,
    };
  }

  async getSalesReport(startDate: Date, endDate: Date) {
    return Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getCategoryReport() {
    return Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          totalSold: { $sum: '$products.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);
  }

  async getUserGrowth() {
    return User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);
  }

  async getTopProducts(limit = 10) {
    return Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          name: { $first: '$products.name' },
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);
  }
}

export const analyticsService = new AnalyticsService();
