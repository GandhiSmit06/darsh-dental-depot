import { Document, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'stripe' | 'cod';

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrderAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  products: IOrderItem[];
  totalPrice: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  razorpayOrderId?: string;
  stripePaymentIntentId?: string;
  address: IOrderAddress;
  invoice?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
