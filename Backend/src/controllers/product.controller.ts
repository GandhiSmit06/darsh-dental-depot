import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body, req.user!._id.toString());
  res.status(201).json(ApiResponse.created('Product created', product));
});

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAllProducts(req);
  res.status(200).json(ApiResponse.ok('Products fetched', result.products, result.meta));
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id as string);
  res.status(200).json(ApiResponse.ok('Product fetched', product));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(
    req.params.id as string,
    req.body,
    req.user!._id.toString(),
    req.user!.role,
  );
  res.status(200).json(ApiResponse.ok('Product updated', product));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id as string, req.user!._id.toString(), req.user!.role);
  res.status(200).json(ApiResponse.ok('Product deleted'));
});

export const exportProducts = asyncHandler(async (_req: Request, res: Response) => {
  const csv = await productService.exportProductsCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.status(200).send(csv);
});

export const importProducts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json(ApiResponse.error('CSV file is required'));
  }
  const count = await productService.importProductsCSV(req.file.buffer, req.user!._id.toString());
  res.status(200).json(ApiResponse.ok(`Imported ${count} products successfully`));
});
