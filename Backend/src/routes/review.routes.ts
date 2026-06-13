import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createReviewValidator } from '../validators/review.validators';

const router = Router();

router.get('/:productId', reviewController.getProductReviews);
router.post('/', authenticate, createReviewValidator, validate, reviewController.createReview);
router.put('/:id/moderate', authenticate, authorize('admin'), reviewController.moderateReview);

export default router;
