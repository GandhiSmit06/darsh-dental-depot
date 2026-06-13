import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import inventoryRoutes from './inventory.routes';
import orderRoutes from './order.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import reviewRoutes from './review.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import paymentRoutes from './payment.routes';
import uploadRoutes from './upload.routes';
import shopRoutes from './shop.routes';
import doctorRoutes from './doctor.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/shop', shopRoutes);
router.use('/doctor', doctorRoutes);

export default router;
