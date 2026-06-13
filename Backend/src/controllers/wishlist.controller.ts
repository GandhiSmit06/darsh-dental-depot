import { Request, Response } from 'express';
import { wishlistService } from '../services/wishlist.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.getWishlist(req.user!._id.toString());
  res.status(200).json(ApiResponse.ok('Wishlist fetched', wishlist));
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.addToWishlist(req.user!._id.toString(), req.body.productId);
  res.status(200).json(ApiResponse.ok('Added to wishlist', wishlist));
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.removeFromWishlist(req.user!._id.toString(), req.params.productId as string);
  res.status(200).json(ApiResponse.ok('Removed from wishlist', wishlist));
});
