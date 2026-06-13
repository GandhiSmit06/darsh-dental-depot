import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/multerUpload';

const router = Router();

router.use(authenticate);

router.post('/image', upload.single('image'), uploadController.uploadSingleImage);
router.post('/images', upload.array('images', 10), uploadController.uploadMultipleImages);

export default router;
