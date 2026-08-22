import { Request, Response } from 'express';
import { doctorService } from '../services/doctor.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await doctorService.getProfile(req.user!._id.toString());
  res.json(ApiResponse.ok('Doctor profile', profile));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await doctorService.updateProfile(req.user!._id.toString(), req.body);
  res.json(ApiResponse.ok('Profile updated', profile));
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await doctorService.getStats(req.user!._id.toString());
  res.json(ApiResponse.ok('Doctor stats', stats));
});

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await doctorService.getCart(req.user!._id.toString());
  res.json(ApiResponse.ok('Doctor cart', cart));
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const cart = await doctorService.addToCart(req.user!._id.toString(), productId, quantity);
  res.json(ApiResponse.ok('Added to cart', cart));
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const cart = await doctorService.updateCartItem(req.user!._id.toString(), req.params.id as string, quantity);
  res.json(ApiResponse.ok('Cart updated', cart));
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await doctorService.removeFromCart(req.user!._id.toString(), req.params.id as string);
  res.json(ApiResponse.ok('Removed from cart', cart));
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await doctorService.getWishlist(req.user!._id.toString());
  res.json(ApiResponse.ok('Doctor wishlist', wishlist));
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body;
  const wishlist = await doctorService.addToWishlist(req.user!._id.toString(), productId);
  res.json(ApiResponse.ok('Added to wishlist', wishlist));
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await doctorService.removeFromWishlist(req.user!._id.toString(), req.params.id as string);
  res.json(ApiResponse.ok('Removed from wishlist', wishlist));
});

export const getActiveOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await doctorService.getActiveOrder(req.user!._id.toString());
  res.json(ApiResponse.ok('Active order', order));
});

export const getOrderHistory = asyncHandler(async (req: Request, res: Response) => {
  const orders = await doctorService.getOrderHistory(req.user!._id.toString());
  res.json(ApiResponse.ok('Order history', orders));
});

export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await doctorService.placeOrderFromCart(req.user!._id.toString(), req.body);
  res.json(ApiResponse.ok('Order processed', result));
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await doctorService.verifyRazorpayPayment(req.user!._id.toString(), req.body);
  res.json(ApiResponse.ok('Payment verified successfully', result));
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await doctorService.cancelOrder(req.user!._id.toString(), req.params.id as string);
  res.json(ApiResponse.ok('Order cancelled successfully', result));
});
