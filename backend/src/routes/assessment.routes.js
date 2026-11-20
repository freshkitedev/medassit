import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { uploadReports, verifyPdfContent } from '../middleware/upload.middleware.js';
import { assessmentInputSchema, historyQuerySchema, objectIdParamSchema } from '../utils/validators.js';
import * as ctrl from '../controllers/assessment.controller.js';

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Assessment limit reached. Please try again later.' },
});

const router = Router();
router.use(requireAuth);

// Singular path per the API spec for creation; plural for retrieval.
router.post('/assessment', createLimiter, uploadReports, verifyPdfContent, validate(assessmentInputSchema), ctrl.createAssessment);
router.get('/assessments', validate(historyQuerySchema, 'query'), ctrl.listAssessments);
router.get('/assessments/:id', validate(objectIdParamSchema, 'params'), ctrl.getAssessment);
router.delete('/assessments/:id', validate(objectIdParamSchema, 'params'), ctrl.deleteAssessment);

export default router;
