import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validators';

const router = Router();

router.post('/register', authRateLimiter, registerValidator, validate, authController.register);
router.post('/register-otp/send', authRateLimiter, registerValidator, validate, authController.sendRegisterOtp);
router.post('/register-otp/verify', authRateLimiter, authController.verifyRegisterOtp);

router.post('/login', authRateLimiter, authController.login);
router.post('/login-otp/send', authRateLimiter, authController.sendLoginOtp);
router.post('/login-otp/verify', authRateLimiter, authController.verifyLoginOtp);

router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/refresh', authController.refreshToken);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validate, authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

export default router;
