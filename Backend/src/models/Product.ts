import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/product.interface';

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Composites',
        'Impression Materials',
        'Endodontics',
        'Orthodontics',
        'Instruments',
        'Disposables',
        'Cements & Adhesives',
        'Whitening',
        'Other',
      ],
    },
    description: { type: String, required: true },
    images: [{ type: String }],
    SKU: { type: String, required: true, unique: true, uppercase: true, trim: true },
    batchNumber: { type: String, trim: true },
    hsnCode: { type: String, trim: true },
    gstPercentage: { type: Number, min: 0, max: 100 },
    manufacturer: { type: String, trim: true },
    brand: { type: String, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    expiryDate: { type: Date },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
    },
    lowStockThreshold: { type: Number, default: 10 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// Full-text search index
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ sellingPrice: 1 });

// Auto-update status based on stock
productSchema.pre('save', function (next) {
  if (this.isModified('stock')) {
    if (this.stock === 0) this.status = 'out_of_stock';
    else if (this.status === 'out_of_stock') this.status = 'active';
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
