import { body } from 'express-validator';

const CATEGORIES = [
  'Composites',
  'Impression Materials',
  'Endodontics',
  'Orthodontics',
  'Instruments',
  'Disposables',
  'Cements & Adhesives',
  'Whitening',
  'Other',
];

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Name too long'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES).withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('SKU')
    .trim()
    .notEmpty().withMessage('SKU is required'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be non-negative integer'),
  body('purchasePrice')
    .notEmpty().withMessage('Purchase price is required')
    .isFloat({ min: 0 }).withMessage('Purchase price must be positive'),
  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ min: 0 }).withMessage('Selling price must be positive'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount price must be positive'),
  body('expiryDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('batchNumber').optional().trim(),
  body('hsnCode').optional().trim(),
  body('gstPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Invalid GST percentage'),
];

export const updateProductValidator = [
  body('name').optional().trim().isLength({ max: 200 }),
  body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('discountPrice').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['active', 'inactive', 'out_of_stock']),
  body('batchNumber').optional().trim(),
  body('hsnCode').optional().trim(),
  body('gstPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Invalid GST percentage'),
];

export const updateStockValidator = [
  body('stock')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock must be non-negative integer'),
];
