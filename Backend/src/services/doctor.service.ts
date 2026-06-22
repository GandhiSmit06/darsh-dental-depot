import { Types } from 'mongoose';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { paymentService } from './payment.service';

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
    const order = await Order.findOne({
      customerId: new Types.ObjectId(doctorId),
      orderStatus: { $nin: ['delivered', 'cancelled'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!order) return null;

    return {
      id: order._id.toString(),
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      itemCount: order.products.reduce((sum, item) => sum + item.quantity, 0),
      total: order.totalPrice,
      status: order.orderStatus,
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

  async placeOrderFromCart(doctorId: string) {
    const userId = new Types.ObjectId(doctorId);
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty.');
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.productId as any;
      if (!product) continue;

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Not enough stock for ${product.name}`);
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

    // Get user address
    const user = await User.findById(userId).lean();

    const order = new Order({
      customerId: userId,
      products: orderItems,
      totalPrice,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'razorpay',
      address: {
        street: user?.address || 'Not provided',
        city: 'Vadodara',
        state: 'Gujarat',
        pincode: '390001',
        country: 'India',
      },
    });

    await order.save();

    // Create Razorpay order (graceful fallback if test keys are invalid)
    let razorpayOrderId = `sim_${order._id.toString()}`;
    let useSimulation = false;
    try {
      const razorpayOrder = await paymentService.createRazorpayOrder(
        totalPrice,
        'INR',
        `receipt_${order._id.toString().slice(-8)}`
      );
      razorpayOrderId = razorpayOrder.id;
    } catch (err: any) {
      console.warn('Razorpay order creation failed, using simulation mode:', err?.message || err);
      useSimulation = true;
      // Mark order as paid immediately in simulation mode
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      await order.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    return {
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      dbOrderId: order._id.toString(),
      razorpayOrderId,
      total: order.totalPrice,
      simulation: useSimulation,
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
