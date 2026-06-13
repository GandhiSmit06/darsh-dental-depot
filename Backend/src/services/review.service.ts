import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { Request } from 'express';

export class ReviewService {
  async createReview(
    userId: string,
    productId: string,
    rating: number,
    comment: string,
    images?: string[],
  ) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product not found.');

    const existing = await Review.findOne({ productId, userId });
    if (existing) throw ApiError.conflict('You have already reviewed this product.');

    const review = await Review.create({ productId, userId, rating, comment, images: images || [] });
    return review;
  }

  async getProductReviews(productId: string, req: Request) {
    const { page, limit, skip, sort } = getPagination(req);
    const filter = { productId, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'fullName profileImage')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return { reviews, meta: buildMeta(total, page, limit) };
  }

  async moderateReview(id: string, isApproved: boolean) {
    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    );
    if (!review) throw ApiError.notFound('Review not found.');

    // Recalculate product rating
    if (isApproved) {
      const stats = await Review.aggregate([
        { $match: { productId: review.productId, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);

      if (stats.length > 0) {
        await Product.findByIdAndUpdate(review.productId, {
          rating: Math.round(stats[0].avg * 10) / 10,
          reviewCount: stats[0].count,
        });
      }
    }

    return review;
  }
}

export const reviewService = new ReviewService();
