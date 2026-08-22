import { Request } from 'express';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildMeta } from '../utils/pagination';
import { exportToCSV, parseCSVBuffer } from '../helpers/csv.helper';
import { redisClient } from '../config/redis';
import { IProduct } from '../interfaces/product.interface';
import { Types } from 'mongoose';

export class ProductService {
  async createProduct(data: Partial<IProduct>, createdBy: string) {
    let sku = data.SKU?.trim().toUpperCase();
    if (!sku) {
      sku = 'DDD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    const existing = await Product.findOne({ SKU: sku });
    if (existing) {
      sku = 'DDD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    }

    const product = await Product.create({ ...data, SKU: sku, createdBy });
    await redisClient.delPattern('products:*');
    return product;
  }

  async getAllProducts(req: Request) {
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { page, limit, skip, sort } = getPagination(req);
    const filter: Record<string, unknown> = {};

    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.brand) filter.brand = { $regex: req.query.brand, $options: 'i' };
    if (req.query.minPrice || req.query.maxPrice) {
      filter.sellingPrice = {
        ...(req.query.minPrice ? { $gte: parseFloat(req.query.minPrice as string) } : {}),
        ...(req.query.maxPrice ? { $lte: parseFloat(req.query.maxPrice as string) } : {}),
      };
    }
    if (req.query.inStock === 'true') filter.stock = { $gt: 0 };
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    let finalSort = sort;
    if (req.query.recommended === 'true') {
      finalSort = { rating: -1, reviewCount: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(req.query.search ? { score: { $meta: 'textScore' } } : finalSort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'fullName clinicName'),
      Product.countDocuments(filter),
    ]);

    const result = { products, meta: buildMeta(total, page, limit) };
    await redisClient.set(cacheKey, JSON.stringify(result), 300); // 5 min cache
    return result;
  }

  async getProductById(id: string) {
    const product = await Product.findById(id).populate('createdBy', 'fullName clinicName');
    if (!product) throw ApiError.notFound('Product not found.');
    return product;
  }

  async updateProduct(id: string, updates: Partial<IProduct>, userId: string, role: string) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found.');

    if (role !== 'admin' && product.createdBy.toString() !== userId) {
      throw ApiError.forbidden('You can only update your own products.');
    }

    Object.assign(product, updates);
    await product.save();
    await redisClient.delPattern('products:*');
    return product;
  }

  async deleteProduct(id: string, userId: string, role: string) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found.');

    if (role !== 'admin' && product.createdBy.toString() !== userId) {
      throw ApiError.forbidden('You can only delete your own products.');
    }

    await product.deleteOne();
    await redisClient.delPattern('products:*');
  }

  async getLowStockProducts() {
    return Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      status: { $ne: 'inactive' },
    });
  }

  async getExpiringProducts(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return Product.find({ expiryDate: { $lte: date, $gte: new Date() } });
  }

  async exportProductsCSV(): Promise<string> {
    const products = await Product.find().lean();
    const fields = [
      { label: 'ID', value: '_id' },
      { label: 'Name', value: 'name' },
      { label: 'SKU', value: 'SKU' },
      { label: 'Category', value: 'category' },
      { label: 'Brand', value: 'brand' },
      { label: 'Stock', value: 'stock' },
      { label: 'Purchase Price', value: 'purchasePrice' },
      { label: 'Selling Price', value: 'sellingPrice' },
      { label: 'Discount Price', value: 'discountPrice' },
      { label: 'Status', value: 'status' },
      { label: 'Expiry Date', value: 'expiryDate' },
    ];
    return exportToCSV(products as any[], fields);
  }

  async importProductsCSV(buffer: Buffer, createdBy: string): Promise<number> {
    const rows = await parseCSVBuffer<Record<string, string>>(buffer);
    let imported = 0;

    for (const row of rows) {
      try {
        await Product.findOneAndUpdate(
          { SKU: row.SKU?.toUpperCase() },
          {
            name: row.Name,
            category: row.Category,
            SKU: row.SKU?.toUpperCase(),
            stock: parseInt(row.Stock) || 0,
            purchasePrice: parseFloat(row['Purchase Price']) || 0,
            sellingPrice: parseFloat(row['Selling Price']) || 0,
            description: row.Description || 'Imported product',
            createdBy: new Types.ObjectId(createdBy),
          },
          { upsert: true, runValidators: true },
        );
        imported++;
      } catch {
        // skip invalid rows
      }
    }

    await redisClient.delPattern('products:*');
    return imported;
  }
}

export const productService = new ProductService();
