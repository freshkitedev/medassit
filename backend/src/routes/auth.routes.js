import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { googleLogin, me, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { googleLoginSchema } from '../utils/validators.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many sign-in attempts. Please try again later.' },
});

const router = Router();
router.post('/google', loginLimiter, validate(googleLoginSchema), googleLogin);
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);
export default router;
