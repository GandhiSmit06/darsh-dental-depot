import { Types } from 'mongoose';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { paymentService } from './payment.service';
import { env } from '../config/env';
import { sendOrderConfirmationEmail } from '../helpers/mailer.helper';

export class DoctorService {
  // ── Profile ──────────────────────────────────────────────────────────────
  async getProfile(doctorId: string) {
    const user = await User.findById(doctorId).lean();
    if (!user) throw ApiError.notFound('Doctor not found.');
    return {
      name: user.fullName,
      email: user.email,
      clinicName: user.clinicName || '',
      phone: user.phone || '',
      address: user.address || '',
    };
  }

  async updateProfile(doctorId: string, updateData: { address?: string }) {
    const user = await User.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!user) throw ApiError.notFound('Doctor not found.');
    return {
      name: user.fullName,
      email: user.email,
      clinicName: user.clinicName || '',
      phone: user.phone || '',
      address: user.address || '',
    };
  }

  // ── Stats ────────────────────────────────────────────────────────────────
  async getStats(doctorId: string) {
    const userId = new Types.ObjectId(doctorId);

    // activeOrders (not delivered or cancelled)
    const activeOrders = await Order.countDocuments({
      customerId: userId,
      orderStatus: { $nin: ['delivered', 'cancelled'] },
    });

    // wishlistCount
    const wishlist = await Wishlist.findOne({ userId }).lean();
    const wishlistCount = wishlist?.products.length || 0;

    // totalSpent
    const allOrders = await Order.find({ customerId: userId, orderStatus: { $ne: 'cancelled' } }).lean();
    const totalSpent = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // cartItems
    const cart = await Cart.findOne({ userId }).lean();
    const cartItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

    // % spent change (vs last week)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekOrders = allOrders.filter((o) => new Date(o.createdAt) >= oneWeekAgo);
    const lastWeekOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= twoWeeksAgo && new Date(o.createdAt) < oneWeekAgo,
    );

    const thisWeekSpent = thisWeekOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const lastWeekSpent = lastWeekOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    let spentChangePercent = 0;
    if (lastWeekSpent === 0) {
      spentChangePercent = thisWeekSpent > 0 ? 100 : 0;
    } else {
      spentChangePercent = Math.round(((thisWeekSpent - lastWeekSpent) / lastWeekSpent) * 1000) / 10;
    }

    return {
      activeOrders,
      wishlistCount,
      totalSpent,
      cartItems,
      spentChangePercent,
    };
  }

  // ── Cart ─────────────────────────────────────────────────────────────────
  async getCart(doctorId: string) {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(doctorId) })
      .populate({
        path: 'items.productId',
        select: 'name brand sellingPrice images',
      })
      .lean();

    if (!cart) return [];

    return cart.items
      .filter((item) => item.productId)
      .map((item: any) => ({
        cartItemId: item._id.toString(),
        productId: item.productId._id.toString(),
        name: item.productId.name,
        brand: item.productId.brand || '',
        imageUrl: item.productId.images?.[0] || '',
        price: item.productId.sellingPrice,
        quantity: item.quantity,
      }));
  }

  async addToCart(doctorId: string, productId: string, quantity: number = 1) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product not found.');

    let cart = await Cart.findOne({ userId: new Types.ObjectId(doctorId) });
    if (!cart) {
      cart = new Cart({ userId: new Types.ObjectId(doctorId), items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId: new Types.ObjectId(productId), quantity });
    }

    await cart.save();
    return this.getCart(doctorId);
  }

  async updateCartItem(doctorId: string, cartItemId: string, quantity: number) {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(doctorId) });
    if (!cart) throw ApiError.notFound('Cart not found.');

    const item = cart.items.find((item: any) => item._id.toString() === cartItemId);
    if (!item) throw ApiError.notFound('Item not found in cart.');

    if (quantity <= 0) {
      cart.items = cart.items.filter((item: any) => item._id.toString() !== cartItemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    return this.getCart(doctorId);
  }

  async removeFromCart(doctorId: string, cartItemId: string) {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(doctorId) });
    if (!cart) throw ApiError.notFound('Cart not found.');

    cart.items = cart.items.filter((item: any) => item._id.toString() !== cartItemId);
    await cart.save();
    return this.getCart(doctorId);
  }

  // ── Wishlist ─────────────────────────────────────────────────────────────
  async getWishlist(doctorId: string) {
    const wishlist = await Wishlist.findOne({ userId: new Types.ObjectId(doctorId) })
      .populate({
        path: 'products',
        select: 'name brand sellingPrice stock rating reviewCount images',
      })
      .lean();

    if (!wishlist) return [];

    return wishlist.products.map((p: any) => ({
      wishlistItemId: p._id.toString(), // Using product ID as wishlist item ID for simplicity on frontend
      productId: p._id.toString(),
      name: p.name,
      brand: p.brand || '',
      price: p.sellingPrice,
      stock: p.stock,
      rating: p.rating,
      reviewCount: p.reviewCount,
      imageUrl: p.images?.[0] || '',
    }));
  }

  async addToWishlist(doctorId: string, productId: string) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product not found.');

    let wishlist = await Wishlist.findOne({ userId: new Types.ObjectId(doctorId) });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: new Types.ObjectId(doctorId), products: [] });
    }

    if (!wishlist.products.includes(new Types.ObjectId(productId))) {
      wishlist.products.push(new Types.ObjectId(productId));
      await wishlist.save();
    }

    return this.getWishlist(doctorId);
  }

  async removeFromWishlist(doctorId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ userId: new Types.ObjectId(doctorId) });
    if (!wishlist) return [];

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    return this.getWishlist(doctorId);
  }

  // ── Orders ───────────────────────────────────────────────────────────────
  async getActiveOrder(doctorId: string) {
    let order = await Order.findOne({
      customerId: new Types.ObjectId(doctorId),
      orderStatus: { $nin: ['delivered', 'cancelled'] },
    })
      .populate('products.productId', 'name images brand')
      .sort({ createdAt: -1 })
      .lean();

    // If no active order, check for the most recent order so delivered status can still be tracked
    if (!order) {
      order = await Order.findOne({
        customerId: new Types.ObjectId(doctorId),
      })
        .populate('products.productId', 'name images brand')
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!order) return null;

    return {
      id: order._id.toString(),
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      itemCount: order.products.reduce((sum, item) => sum + item.quantity, 0),
      total: order.totalPrice,
      status: order.orderStatus,
      products: order.products.map((p: any) => ({
        name: p.productId?.name || 'Dental Material',
        brand: p.productId?.brand || '',
        image: p.productId?.images?.[0] || '',
        quantity: p.quantity,
        price: p.price,
      })),
      createdAt: order.createdAt,
    };
  }

  async getOrderHistory(doctorId: string) {
    const orders = await Order.find({ customerId: new Types.ObjectId(doctorId) })
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((o) => ({
      id: o._id.toString(),
      orderId: `ORD-${o._id.toString().slice(-6).toUpperCase()}`,
      itemCount: o.products.reduce((sum, item) => sum + item.quantity, 0),
      total: o.totalPrice,
      status: o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1),
      date: o.createdAt.toISOString().split('T')[0],
    }));
  }

  async placeOrderFromCart(
    doctorId: string,
    payload?: {
      address?: {
        clinicName?: string;
        contactName?: string;
        contactPhone?: string;
        street: string;
        landmark?: string;
        city?: string;
        state?: string;
        pincode?: string;
      };
      paymentMethod?: 'razorpay' | 'cod';
      notes?: string;
    }
  ) {
    const userId = new Types.ObjectId(doctorId);
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty. Please add dental products before checking out.');
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.productId as any;
      if (!product) continue;

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.sellingPrice,
      });

      totalPrice += product.sellingPrice * item.quantity;
      
      // Reduce stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const user = await User.findById(userId).lean();
    const paymentMethod = payload?.paymentMethod || 'razorpay';
    const street = payload?.address?.street || user?.address || 'Vadodara Clinic';
    const landmark = payload?.address?.landmark ? ` (Landmark: ${payload.address.landmark})` : '';
    const clinicName = payload?.address?.clinicName || user?.clinicName || 'Clinic';
    const contactPhone = payload?.address?.contactPhone || user?.phone || '';

    const order = new Order({
      customerId: userId,
      products: orderItems,
      totalPrice,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
      address: {
        street: `${street}${landmark}`,
        city: payload?.address?.city || 'Vadodara',
        state: payload?.address?.state || 'Gujarat',
        pincode: payload?.address?.pincode || '390001',
        country: 'India',
      },
      notes: payload?.notes || `Clinic: ${clinicName}, Phone: ${contactPhone}`,
    });

    await order.save();

    // If COD, clear cart and return confirmation
    if (paymentMethod === 'cod') {
      cart.items = [];
      await cart.save();

      try {
        if (user?.email) {
          await sendOrderConfirmationEmail(
            user.email,
            user.fullName || 'Doctor',
            order._id.toString(),
            totalPrice,
            orderItems
          );
        }
      } catch {}

      return {
        orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        dbOrderId: order._id.toString(),
        total: order.totalPrice,
        paymentMethod: 'cod',
        message: 'Order placed successfully! Payment will be collected upon delivery at your clinic.',
      };
    }

    // Razorpay Flow
    let razorpayOrderId = `sim_${order._id.toString()}`;
    let useSimulation = false;
    try {
      const razorpayOrder = await paymentService.createRazorpayOrder(
        totalPrice,
        'INR',
        `rcpt_${order._id.toString().slice(-8)}`
      );
      razorpayOrderId = razorpayOrder.id;
      order.razorpayOrderId = razorpayOrderId;
      await order.save();
    } catch (err: any) {
      console.warn('Razorpay order creation fallback:', err?.message || err);
      useSimulation = true;
    }

    return {
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      dbOrderId: order._id.toString(),
      razorpayOrderId,
      amount: Math.round(totalPrice * 100),
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_RvTaFgHR4Y5TPv',
      total: order.totalPrice,
      simulation: useSimulation,
      paymentMethod: 'razorpay',
    };
  }

  async verifyRazorpayPayment(
    doctorId: string,
    data: {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ) {
    const userId = new Types.ObjectId(doctorId);
    const order = await paymentService.verifyRazorpayPayment(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
      data.orderId
    );

    // Clear cart on successful payment
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    const user = await User.findById(userId).lean();
    try {
      if (user?.email) {
        await sendOrderConfirmationEmail(
          user.email,
          user.fullName || 'Doctor',
          order._id.toString(),
          order.totalPrice,
          order.products as any
        );
      }
    } catch {}

    return {
      success: true,
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      order,
    };
  }

  async cancelOrder(doctorId: string, orderId: string) {
    const order = await Order.findOne({
      _id: new Types.ObjectId(orderId),
      customerId: new Types.ObjectId(doctorId)
    });

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
      throw ApiError.badRequest('Order cannot be cancelled at this stage.');
    }

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    return { success: true };
  }
}

export const doctorService = new DoctorService();
