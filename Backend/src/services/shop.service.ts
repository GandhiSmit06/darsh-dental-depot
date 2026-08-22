import { Types } from 'mongoose';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Invoice } from '../models/Invoice';
import { ApiError } from '../utils/ApiError';

export class ShopService {
  // ── Stats (for Dashboard stat cards) ───────────────────────────────────────
  async getStats(shopOwnerId: string) {
    const ownerId = new Types.ObjectId(shopOwnerId);

    // Get all product IDs owned by this shop
    const shopProductIds = await Product.find({ createdBy: ownerId }).distinct('_id');

    // All orders that contain at least one product from this shop
    const allOrders = await Order.find({ 'products.productId': { $in: shopProductIds } }).lean();

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekOrders = allOrders.filter((o) => new Date(o.createdAt) >= oneWeekAgo);
    const lastWeekOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= twoWeeksAgo && new Date(o.createdAt) < oneWeekAgo,
    );

    const totalSales = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const deliveredOrders = allOrders.filter((o) => o.orderStatus === 'delivered');
    const revenue = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const orderCount = allOrders.length;

    // Unique customers who ordered from this shop
    const customerIds = new Set(allOrders.map((o) => o.customerId.toString()));
    const customerCount = customerIds.size;

    const pctChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    };

    const thisWeekSales = thisWeekOrders.reduce((s, o) => s + o.totalPrice, 0);
    const lastWeekSales = lastWeekOrders.reduce((s, o) => s + o.totalPrice, 0);

    return {
      totalSales,
      revenue,
      orders: orderCount,
      customers: customerCount,
      weeklyChanges: {
        sales: pctChange(thisWeekSales, lastWeekSales),
        revenue: pctChange(
          thisWeekOrders.filter((o) => o.orderStatus === 'delivered').reduce((s, o) => s + o.totalPrice, 0),
          lastWeekOrders.filter((o) => o.orderStatus === 'delivered').reduce((s, o) => s + o.totalPrice, 0),
        ),
        orders: pctChange(thisWeekOrders.length, lastWeekOrders.length),
        customers: pctChange(
          new Set(thisWeekOrders.map((o) => o.customerId.toString())).size,
          new Set(lastWeekOrders.map((o) => o.customerId.toString())).size,
        ),
      },
    };
  }

  // ── Products list ──────────────────────────────────────────────────────────
  async getProducts(shopOwnerId: string) {
    const products = await Product.find({ createdBy: shopOwnerId })
      .select('name category brand sellingPrice purchasePrice stock images SKU status hsnCode gstPercentage batchNumber description')
      .sort({ createdAt: -1 })
      .lean();

    return products.map((p) => ({
      _id: p._id,
      sku: p.SKU,
      name: p.name,
      category: p.category,
      brand: p.brand || '',
      price: p.sellingPrice,
      sellingPrice: p.sellingPrice,
      purchasePrice: p.purchasePrice,
      stock: p.stock,
      imageUrl: p.images?.[0] || '',
      status: p.status,
      hsnCode: p.hsnCode,
      gstPercentage: p.gstPercentage,
      batchNumber: p.batchNumber,
      description: p.description,
    }));
  }

  // ── Inventory view ─────────────────────────────────────────────────────────
  async getInventory(shopOwnerId: string) {
    const products = await Product.find({ createdBy: shopOwnerId })
      .select('SKU name stock status lowStockThreshold')
      .sort({ stock: 1 })
      .lean();

    return products.map((p) => ({
      _id: p._id,
      sku: p.SKU,
      productName: p.name,
      stock: p.stock,
      status:
        p.stock === 0
          ? 'Out of Stock'
          : p.stock <= p.lowStockThreshold
            ? 'Low Stock'
            : 'In Stock',
    }));
  }

  // ── Orders for this shop ───────────────────────────────────────────────────
  async getOrders(shopOwnerId: string) {
    const ownerId = new Types.ObjectId(shopOwnerId);
    const shopProductIds = await Product.find({ createdBy: ownerId }).distinct('_id');

    const orders = await Order.find({ 'products.productId': { $in: shopProductIds } })
      .populate('customerId', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((o) => {
      const customer = o.customerId as unknown as { fullName: string; email: string } | null;
      return {
        _id: o._id,
        orderId: `ORD-${o._id.toString().slice(-6).toUpperCase()}`,
        customerName: customer?.fullName || 'Unknown',
        customerEmail: customer?.email || '',
        itemCount: o.products.reduce((sum, p) => sum + p.quantity, 0),
        total: o.totalPrice,
        status: o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1),
        paymentStatus: o.paymentStatus,
        date: o.createdAt.toISOString().split('T')[0],
      };
    });
  }

  // ── Invoice for an order ───────────────────────────────────────────────────
  async getOrderInvoice(orderId: string, shopOwnerId: string) {
    const order = await Order.findById(orderId)
      .populate('customerId', 'fullName email phone address')
      .lean();

    if (!order) throw ApiError.notFound('Order not found.');

    // Verify order contains products from this shop
    const ownerId = new Types.ObjectId(shopOwnerId);
    const shopProductIds = await Product.find({ createdBy: ownerId }).distinct('_id');
    const hasShopProducts = order.products.some((p) =>
      shopProductIds.some((id: Types.ObjectId) => id.toString() === p.productId.toString()),
    );

    if (!hasShopProducts) throw ApiError.forbidden('This order does not belong to your shop.');

    // Check if invoice exists
    const invoice = await Invoice.findOne({ orderId: order._id }).lean();

    const customer = order.customerId as unknown as {
      fullName: string;
      email: string;
      phone: string;
      address: string;
    } | null;

    return {
      invoiceNumber: invoice?.invoiceNumber || `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      date: order.createdAt.toISOString().split('T')[0],
      customer: {
        name: customer?.fullName || 'Unknown',
        email: customer?.email || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
      },
      items: order.products.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        total: p.quantity * p.price,
      })),
      subtotal: order.totalPrice,
      tax: invoice?.taxAmount || 0,
      total: order.totalPrice + (invoice?.taxAmount || 0),
    };
  }

  // ── Analytics: Weekly sales (last 7 days) ──────────────────────────────────
  async getWeeklySales(shopOwnerId: string) {
    const ownerId = new Types.ObjectId(shopOwnerId);
    const shopProductIds = await Product.find({ createdBy: ownerId }).distinct('_id');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          'products.productId': { $in: shopProductIds },
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    const result = await Order.aggregate(pipeline);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day, i) => ({
      day,
      sales: result.find((r) => r._id === i + 1)?.sales || 0,
    }));
  }

  // ── Analytics: Monthly trend (last 12 months) ─────────────────────────────
  async getMonthlyTrend(shopOwnerId: string) {
    const ownerId = new Types.ObjectId(shopOwnerId);
    const shopProductIds = await Product.find({ createdBy: ownerId }).distinct('_id');

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          'products.productId': { $in: shopProductIds },
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          sales: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1 as const, '_id.month': 1 as const } },
    ];

    const result = await Order.aggregate(pipeline);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const output = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const match = result.find(
        (r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1,
      );
      output.push({
        month: months[d.getMonth()],
        sales: match?.sales || 0,
        orders: match?.orders || 0,
      });
    }

    return output;
  }

  // ── Analytics: Category share ──────────────────────────────────────────────
  async getCategoryShare(shopOwnerId: string) {
    const ownerId = new Types.ObjectId(shopOwnerId);

    const pipeline = [
      { $match: { createdBy: ownerId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 as const } },
    ];

    const result = await Product.aggregate(pipeline);
    const total = result.reduce((s, r) => s + r.count, 0);

    return result.map((r) => ({
      name: r._id,
      value: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  }

  // ── Analytics: Product performance (top products by units sold) ────────────
  async getProductPerformance(shopOwnerId: string) {
    const ownerId = new Types.ObjectId(shopOwnerId);
    const shopProductIds = await Product.find({ createdBy: ownerId }).distinct('_id');

    const pipeline = [
      { $match: { 'products.productId': { $in: shopProductIds } } },
      { $unwind: '$products' },
      { $match: { 'products.productId': { $in: shopProductIds } } },
      {
        $group: {
          _id: '$products.productId',
          productName: { $first: '$products.name' },
          unitsSold: { $sum: '$products.quantity' },
        },
      },
      { $sort: { unitsSold: -1 as const } },
      { $limit: 10 },
    ];

    const result = await Order.aggregate(pipeline);

    // If no orders exist, fall back to showing products with 0 sales
    if (result.length === 0) {
      const products = await Product.find({ createdBy: ownerId })
        .select('name')
        .limit(10)
        .lean();
      return products.map((p) => ({
        productName: p.name.split(' ').slice(0, 2).join(' '),
        unitsSold: 0,
      }));
    }

    return result.map((r) => ({
      productName: r.productName.split(' ').slice(0, 2).join(' '),
      unitsSold: r.unitsSold,
    }));
  }

  // ── Customers: Real registered Vadodara clinics & doctors ──────────────────
  async getCustomers(shopOwnerId: string) {
    const ownerId = new Types.ObjectId(shopOwnerId);
    const shopProductIds = await Product.find({ createdBy: ownerId }).distinct('_id');
    const allOrders = await Order.find({ 'products.productId': { $in: shopProductIds } })
      .populate('customerId', 'fullName email phone clinicName address')
      .lean();

    const customerMap = new Map<string, any>();
    for (const order of allOrders) {
      const cust = order.customerId as any;
      if (!cust || !cust._id) continue;
      const cid = cust._id.toString();
      if (!customerMap.has(cid)) {
        customerMap.set(cid, {
          _id: cid,
          name: cust.fullName || 'Doctor',
          email: cust.email || '',
          phone: cust.phone || '',
          clinicName: cust.clinicName || 'Dental Practice',
          orders: 1,
          spent: order.totalPrice || 0,
        });
      } else {
        const existing = customerMap.get(cid);
        existing.orders += 1;
        existing.spent += order.totalPrice || 0;
      }
    }

    // Include all registered doctors if few or no orders
    const doctors = await User.find({ role: 'doctor' })
      .select('fullName email phone clinicName address')
      .lean();

    for (const d of doctors) {
      const did = d._id.toString();
      if (!customerMap.has(did)) {
        customerMap.set(did, {
          _id: did,
          name: d.fullName,
          email: d.email,
          phone: d.phone,
          clinicName: d.clinicName || 'Dental Practice',
          orders: 0,
          spent: 0,
        });
      }
    }

    return Array.from(customerMap.values());
  }
}

export const shopService = new ShopService();
