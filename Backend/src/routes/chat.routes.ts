import { Router } from 'express';
import { chatRateLimiter } from '../middleware/rateLimiter';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// Rate-limited AI chat proxy endpoint
router.post('/message', chatRateLimiter, chatController.sendMessage);

export default router;
