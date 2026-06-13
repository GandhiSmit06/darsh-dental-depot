import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createOrderValidator, updateOrderStatusValidator } from '../validators/order.validators';

const router = Router();

router.use(authenticate);

router.post('/', createOrderValidator, validate, orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', authorize('admin', 'shop_owner'), updateOrderStatusValidator, validate, orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
