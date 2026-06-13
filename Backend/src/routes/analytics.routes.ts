import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/summary', analyticsController.getDashboardSummary);
router.get('/sales', analyticsController.getSalesReport);
router.get('/categories', analyticsController.getCategoryReport);
router.get('/users', analyticsController.getUserGrowth);
router.get('/top-products', analyticsController.getTopProducts);

export default router;
