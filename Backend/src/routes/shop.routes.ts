import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import * as shopCtrl from '../controllers/shop.controller';

const router = Router();

// All shop routes require authentication + shop_owner role
router.use(authenticate, authorize('shop_owner'));

router.get('/stats', shopCtrl.getStats);
router.get('/products', shopCtrl.getProducts);
router.get('/inventory', shopCtrl.getInventory);
router.get('/orders', shopCtrl.getOrders);
router.get('/orders/:id/invoice', shopCtrl.getOrderInvoice);
router.get('/analytics/weekly-sales', shopCtrl.getWeeklySales);
router.get('/analytics/monthly-trend', shopCtrl.getMonthlyTrend);
router.get('/analytics/category-share', shopCtrl.getCategoryShare);
router.get('/analytics/product-performance', shopCtrl.getProductPerformance);

export default router;
