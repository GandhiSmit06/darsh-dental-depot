import { Router, Request, Response } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Stripe webhook requires raw body — must be before express.json()
router.post('/stripe/webhook', paymentController.stripeWebhook);

router.use(authenticate);

router.post('/razorpay/create', paymentController.createRazorpayOrder);
router.post('/razorpay/verify', paymentController.verifyRazorpayPayment);
router.post('/stripe/intent', paymentController.createStripePaymentIntent);

export default router;
