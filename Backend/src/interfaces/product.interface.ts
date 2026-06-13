import { Document, Types } from 'mongoose';

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  description: string;
  images: string[];
  SKU: string;
  batchNumber?: string;
  manufacturer?: string;
  brand?: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  discountPrice?: number;
  expiryDate?: Date;
  status: ProductStatus;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
