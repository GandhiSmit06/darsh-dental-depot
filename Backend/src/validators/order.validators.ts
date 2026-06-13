import { body } from 'express-validator';

export const createOrderValidator = [
  body('products')
    .isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('products.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['razorpay', 'stripe', 'cod']).withMessage('Invalid payment method'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode')
    .notEmpty().withMessage('Pincode is required')
    .matches(/^\d{6}$/).withMessage('Invalid pincode'),
  body('address.country').optional(),
  body('notes').optional().trim(),
];

export const updateOrderStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];
