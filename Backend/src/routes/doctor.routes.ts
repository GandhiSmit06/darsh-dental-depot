import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import * as doctorCtrl from '../controllers/doctor.controller';

const router = Router();

// All doctor routes require authentication + doctor role
router.use(authenticate, authorize('doctor'));

// Profile & Stats
router.get('/profile', doctorCtrl.getProfile);
router.put('/profile', doctorCtrl.updateProfile);
router.get('/stats', doctorCtrl.getStats);

// Cart
router.get('/cart', doctorCtrl.getCart);
router.post('/cart', doctorCtrl.addToCart);
router.patch('/cart/:id', doctorCtrl.updateCartItem);
router.delete('/cart/:id', doctorCtrl.removeFromCart);

// Wishlist
router.get('/wishlist', doctorCtrl.getWishlist);
router.post('/wishlist', doctorCtrl.addToWishlist);
router.delete('/wishlist/:id', doctorCtrl.removeFromWishlist);

// Orders
router.get('/orders/active', doctorCtrl.getActiveOrder);
router.get('/orders/history', doctorCtrl.getOrderHistory);
router.post('/orders', doctorCtrl.placeOrder);
router.post('/orders/verify-payment', doctorCtrl.verifyPayment);
router.post('/orders/:id/cancel', doctorCtrl.cancelOrder);

export default router;
