import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { Types } from 'mongoose';

export class WishlistService {
  async getWishlist(userId: string) {
    const wishlist = await Wishlist.findOne({ userId }).populate(
      'products',
      'name images sellingPrice discountPrice status stock',
    );
    return wishlist || { userId, products: [] };
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product not found.');

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    const pid = new Types.ObjectId(productId);
    if (!wishlist.products.some((p) => p.equals(pid))) {
      wishlist.products.push(pid);
      await wishlist.save();
    }

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) throw ApiError.notFound('Wishlist not found.');

    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
    await wishlist.save();
    return this.getWishlist(userId);
  }
}

export const wishlistService = new WishlistService();
