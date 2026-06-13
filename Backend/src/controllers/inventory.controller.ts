import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { Product } from '../models/Product';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getInventory = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAllProducts(req);
  const summary = {
    totalProducts: result.meta.total,
    lowStockProducts: (await productService.getLowStockProducts()).length,
    expiringProducts: (await productService.getExpiringProducts(30)).length,
  };
  res.status(200).json(ApiResponse.ok('Inventory fetched', result.products, { ...result.meta, ...summary }));
});

export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const { stock } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');

  product.stock = stock;
  await product.save();
  res.status(200).json(ApiResponse.ok('Stock updated', product));
});

export const getLowStockProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getLowStockProducts();
  res.status(200).json(ApiResponse.ok('Low stock products', products));
});

export const getExpiringProducts = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const products = await productService.getExpiringProducts(days);
  res.status(200).json(ApiResponse.ok(`Products expiring in ${days} days`, products));
});
