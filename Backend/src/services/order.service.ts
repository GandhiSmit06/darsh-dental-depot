import { Request } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Invoice } from '../models/Invoice';
import { Notification } from '../models/Notification';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { generateInvoicePDF, uploadInvoiceToCloudinary } from '../helpers/invoice.helper';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../helpers/mailer.helper';
import { IOrder, IOrderItem } from '../interfaces/order.interface';
import { User } from '../models/User';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export class OrderService {
  async createOrder(
    customerId: string,
    items: { productId: string; quantity: number }[],
    paymentMethod: IOrder['paymentMethod'],
    address: IOrder['address'],
    notes?: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orderItems: IOrderItem[] = [];
      let totalPrice = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw ApiError.notFound(`Product ${item.productId} not found.`);
        if (product.stock < item.quantity) {
          throw ApiError.badRequest(`Insufficient stock for ${product.name}.`);
        }

        const price = product.discountPrice || product.sellingPrice;
        orderItems.push({
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          price,
        });
        totalPrice += price * item.quantity;

        // Deduct stock
        product.stock -= item.quantity;
        await product.save({ session });
      }

      const [order] = await Order.create(
        [{ customerId, products: orderItems, totalPrice, paymentMethod, address, notes }],
        { session },
      );

      await session.commitTransaction();

      // Generate invoice
      const invoiceNumber = `INV-${dayjs().format('YYYYMMDD')}-${uuidv4().slice(0, 6).toUpperCase()}`;
      const customer = await User.findById(customerId);

      try {
        const pdfBuffer = await generateInvoicePDF({
          invoiceNumber,
          orderId: order._id.toString(),
          date: new Date(),
          customer: {
            name: customer?.fullName || 'Customer',
            email: customer?.email || '',
            address: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`,
          },
          items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          subtotal: totalPrice,
          tax: totalPrice * 0.18,
          total: totalPrice * 1.18,
        });

        const pdfUrl = await uploadInvoiceToCloudinary(pdfBuffer, invoiceNumber);

        const invoice = await Invoice.create({
          orderId: order._id,
          invoiceNumber,
          pdfUrl,
          totalAmount: totalPrice * 1.18,
          taxAmount: totalPrice * 0.18,
        });

        order.invoice = invoice._id;
        await order.save();
      } catch {
        // invoice generation failure should not fail the order
      }

      // Send confirmation email
      if (customer) {
        try {
          await sendOrderConfirmationEmail(
            customer.email,
            customer.fullName,
            order._id.toString(),
            totalPrice,
            orderItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          );
        } catch { }
      }

      // Create notification
      await Notification.create({
        userId: customerId,
        type: 'order',
        title: 'Order Placed Successfully',
        message: `Your order has been placed. Total: ₹${totalPrice.toFixed(2)}`,
        link: `/orders/${order._id}`,
      });

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllOrders(req: Request) {
    const { page, limit, skip, sort } = getPagination(req);
    const filter: Record<string, unknown> = {};

    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.customerId) filter.customerId = req.query.customerId;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'fullName email phone')
        .populate('invoice')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return { orders, meta: buildMeta(total, page, limit) };
  }

  async getOrderById(id: string, userId?: string, role?: string) {
    const order = await Order.findById(id)
      .populate('customerId', 'fullName email phone')
      .populate('invoice')
      .populate('products.productId', 'name images');

    if (!order) throw ApiError.notFound('Order not found.');

    if (role !== 'admin' && order.customerId._id.toString() !== userId) {
      throw ApiError.forbidden('Access denied.');
    }

    return order;
  }

  async getOrdersByUser(userId: string, req: Request) {
    const { page, limit, skip, sort } = getPagination(req);
    const [orders, total] = await Promise.all([
      Order.find({ customerId: userId })
        .populate('invoice')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ customerId: userId }),
    ]);
    return { orders, meta: buildMeta(total, page, limit) };
  }

  async updateOrderStatus(id: string, status: IOrder['orderStatus']) {
    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true },
    ).populate('customerId', 'fullName email');

    if (!order) throw ApiError.notFound('Order not found.');

    // Notify customer
    await Notification.create({
      userId: order.customerId._id,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order status is now: ${status.toUpperCase()}`,
      link: `/orders/${order._id}`,
    });

    const customer = order.customerId as any;
    try {
      await sendOrderStatusEmail(customer.email, customer.fullName, order._id.toString(), status);
    } catch { }

    return order;
  }

  async cancelOrder(id: string, userId: string, role: string) {
    const order = await Order.findById(id);
    if (!order) throw ApiError.notFound('Order not found.');

    if (role !== 'admin' && order.customerId.toString() !== userId) {
      throw ApiError.forbidden('Access denied.');
    }

    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      throw ApiError.badRequest('Cannot cancel a shipped or delivered order.');
    }

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    order.orderStatus = 'cancelled';
    await order.save();
    return order;
  }
}

export const orderService = new OrderService();
