import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  orderId: Types.ObjectId;
  invoiceNumber: string;
  pdfUrl: string;
  totalAmount: number;
  taxAmount: number;
  createdAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },
    pdfUrl: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
