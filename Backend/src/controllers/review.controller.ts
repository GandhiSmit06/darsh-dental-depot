import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { productId, rating, comment } = req.body;
  const review = await reviewService.createReview(
    req.user!._id.toString(),
    productId,
    rating,
    comment,
  );
  res.status(201).json(ApiResponse.created('Review submitted (pending approval)', review));
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { reviews, meta } = await reviewService.getProductReviews(req.params.productId as string, req);
  res.status(200).json(ApiResponse.ok('Reviews fetched', reviews, meta));
});

export const moderateReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.moderateReview(req.params.id as string, req.body.isApproved);
  res.status(200).json(ApiResponse.ok('Review moderated', review));
});
