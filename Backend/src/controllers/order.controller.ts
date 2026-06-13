import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { products, paymentMethod, address, notes } = req.body;
  const order = await orderService.createOrder(
    req.user!._id.toString(),
    products,
    paymentMethod,
    address,
    notes,
  );
  res.status(201).json(ApiResponse.created('Order placed successfully', order));
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  // Non-admins can only see their own orders
  if (req.user!.role !== 'admin') {
    req.query.customerId = req.user!._id.toString();
  }
  const { orders, meta } = await orderService.getAllOrders(req);
  res.status(200).json(ApiResponse.ok('Orders fetched', orders, meta));
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(
    req.params.id as string,
    req.user!._id.toString(),
    req.user!.role,
  );
  res.status(200).json(ApiResponse.ok('Order fetched', order));
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id as string, req.body.status);
  res.status(200).json(ApiResponse.ok('Order status updated', order));
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(
    req.params.id as string,
    req.user!._id.toString(),
    req.user!.role,
  );
  res.status(200).json(ApiResponse.ok('Order cancelled', order));
});
