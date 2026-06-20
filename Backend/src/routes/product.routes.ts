import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createProductValidator, updateProductValidator } from '../validators/product.validators';
import multer from 'multer';

const router = Router();
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Protected routes
router.get('/', authenticate, productController.getAllProducts);
router.get('/export-csv', authenticate, authorize('admin', 'shop_owner'), productController.exportProducts);
router.get('/:id', authenticate, productController.getProductById);

router.post(
  '/',
  authenticate,
  authorize('admin', 'shop_owner'),
  createProductValidator,
  validate,
  productController.createProduct,
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'shop_owner'),
  updateProductValidator,
  validate,
  productController.updateProduct,
);
router.delete('/:id', authenticate, authorize('admin', 'shop_owner'), productController.deleteProduct);
router.post(
  '/import-csv',
  authenticate,
  authorize('admin', 'shop_owner'),
  csvUpload.single('file'),
  productController.importProducts,
);

export default router;
