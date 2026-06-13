import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateStockValidator } from '../validators/product.validators';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'shop_owner'), inventoryController.getInventory);
router.get('/low-stock', authorize('admin', 'shop_owner'), inventoryController.getLowStockProducts);
router.get('/expiring', authorize('admin', 'shop_owner'), inventoryController.getExpiringProducts);
router.put('/update-stock/:id', authorize('admin', 'shop_owner'), updateStockValidator, validate, inventoryController.updateStock);

export default router;
