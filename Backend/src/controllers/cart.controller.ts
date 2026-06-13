import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!._id.toString());
  res.status(200).json(ApiResponse.ok('Cart fetched', cart));
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addToCart(req.user!._id.toString(), productId, quantity || 1);
  res.status(200).json(ApiResponse.ok('Item added to cart', cart));
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.updateCartItem(req.user!._id.toString(), req.params.itemId as string, req.body.quantity);
  res.status(200).json(ApiResponse.ok('Cart updated', cart));
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeCartItem(req.user!._id.toString(), req.params.itemId as string);
  res.status(200).json(ApiResponse.ok('Item removed from cart', cart));
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await cartService.clearCart(req.user!._id.toString());
  res.status(200).json(ApiResponse.ok('Cart cleared'));
});
