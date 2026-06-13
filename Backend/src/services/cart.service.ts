import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';

export class CartService {
  async getCart(userId: string) {
    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name images sellingPrice discountPrice stock status');
    if (!cart) return { userId, items: [], total: 0 };

    const total = cart.items.reduce((sum, item) => {
      const product = item.productId as any;
      const price = product?.discountPrice || product?.sellingPrice || 0;
      return sum + price * item.quantity;
    }, 0);

    return { ...cart.toObject(), total };
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product not found.');
    if (product.status !== 'active') throw ApiError.badRequest('Product is not available.');
    if (product.stock < quantity) throw ApiError.badRequest('Insufficient stock.');

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (i) => i.productId.toString() === productId,
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ productId: product._id, quantity } as any);
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw ApiError.notFound('Cart not found.');

    const item = cart.items.find((i) => (i as any)._id.toString() === itemId);
    if (!item) throw ApiError.notFound('Cart item not found.');

    const product = await Product.findById(item.productId);
    if (!product || product.stock < quantity) {
      throw ApiError.badRequest('Insufficient stock.');
    }

    item.quantity = quantity;
    await cart.save();
    return this.getCart(userId);
  }

  async removeCartItem(userId: string, itemId: string) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw ApiError.notFound('Cart not found.');

    cart.items = cart.items.filter((i) => (i as any)._id.toString() !== itemId);
    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await Cart.findOneAndUpdate({ userId }, { items: [] });
  }
}

export const cartService = new CartService();
