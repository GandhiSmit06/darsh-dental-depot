import { Request, Response } from 'express';
import { shopService } from '../services/shop.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await shopService.getStats(req.user!._id.toString());
  res.json(ApiResponse.ok('Shop stats', stats));
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await shopService.getProducts(req.user!._id.toString());
  res.json(ApiResponse.ok('Shop products', products));
});

export const getInventory = asyncHandler(async (req: Request, res: Response) => {
  const inventory = await shopService.getInventory(req.user!._id.toString());
  res.json(ApiResponse.ok('Shop inventory', inventory));
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await shopService.getOrders(req.user!._id.toString());
  res.json(ApiResponse.ok('Shop orders', orders));
});

export const getOrderInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await shopService.getOrderInvoice(req.params.id as string, req.user!._id.toString());
  res.json(ApiResponse.ok('Invoice data', invoice));
});

export const getWeeklySales = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.getWeeklySales(req.user!._id.toString());
  res.json(ApiResponse.ok('Weekly sales', data));
});

export const getMonthlyTrend = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.getMonthlyTrend(req.user!._id.toString());
  res.json(ApiResponse.ok('Monthly trend', data));
});

export const getCategoryShare = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.getCategoryShare(req.user!._id.toString());
  res.json(ApiResponse.ok('Category share', data));
});

export const getProductPerformance = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.getProductPerformance(req.user!._id.toString());
  res.json(ApiResponse.ok('Product performance', data));
});

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const data = await shopService.getCustomers(req.user!._id.toString());
  res.json(ApiResponse.ok('Shop customers', data));
});
