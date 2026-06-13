import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  date: Date;
  revenue: number;
  ordersCount: number;
  newUsers: number;
  productViews: number;
  topProducts: { productId: mongoose.Types.ObjectId; name: string; sales: number }[];
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    date: { type: Date, required: true, unique: true, index: true },
    revenue: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    productViews: { type: Number, default: 0 },
    topProducts: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        sales: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
