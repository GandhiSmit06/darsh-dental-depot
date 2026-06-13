import crypto from 'crypto';
import { razorpay } from '../config/razorpay';
import { stripe } from '../config/stripe';
import { Order } from '../models/Order';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export class PaymentService {
  // ─── Razorpay ───────────────────────────────────────────────────────────────

  async createRazorpayOrder(amount: number, currency = 'INR', receipt: string) {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt,
    });
    return order;
  }

  async verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    orderId: string,
  ) {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw ApiError.badRequest('Invalid payment signature. Payment verification failed.');
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        paymentId: razorpayPaymentId,
        razorpayOrderId,
        orderStatus: 'processing',
      },
      { new: true },
    );

    if (!order) throw ApiError.notFound('Order not found.');
    return order;
  }

  // ─── Stripe ─────────────────────────────────────────────────────────────────

  async createStripePaymentIntent(amount: number, currency = 'inr', metadata: Record<string, string>) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // smallest currency unit
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw ApiError.badRequest('Invalid Stripe webhook signature.');
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as any;
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          paymentId: intent.id,
          stripePaymentIntentId: intent.id,
          orderStatus: 'processing',
        });
      }
    }

    return { received: true };
  }
}

export const paymentService = new PaymentService();
