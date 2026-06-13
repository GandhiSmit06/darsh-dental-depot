import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { v4 as uuidv4 } from 'uuid';

export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
  const { amount, currency } = req.body;
  const receipt = `receipt_${uuidv4().slice(0, 8)}`;
  const order = await paymentService.createRazorpayOrder(amount, currency || 'INR', receipt);
  res.status(200).json(ApiResponse.ok('Razorpay order created', order));
});

export const verifyRazorpayPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
  const order = await paymentService.verifyRazorpayPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId,
  );
  res.status(200).json(ApiResponse.ok('Payment verified successfully', order));
});

export const createStripePaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { amount, currency, orderId } = req.body;
  const data = await paymentService.createStripePaymentIntent(
    amount,
    currency || 'inr',
    { orderId, userId: req.user!._id.toString() },
  );
  res.status(200).json(ApiResponse.ok('Stripe payment intent created', data));
});

// Raw body needed for Stripe webhook verification — handled in app.ts
export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const result = await paymentService.handleStripeWebhook(req.body as Buffer, signature);
  res.status(200).json(result);
});
