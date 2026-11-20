import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadAudio, verifyAudioContent } from '../middleware/upload.middleware.js';
import { transcribeAudio } from '../controllers/transcription.controller.js';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Transcription limit reached. Please try again later.' },
});

const router = Router();
router.post('/', requireAuth, limiter, uploadAudio, verifyAudioContent, transcribeAudio);
export default router;
