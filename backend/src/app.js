import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { createSessionMiddleware } from './config/session.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import transcriptionRoutes from './routes/transcription.routes.js';

/** Call after the database connection is established (the session store needs it). */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (env.isProd) app.set('trust proxy', 1); // correct client IP + secure cookies behind a proxy

  app.use(helmet());
  app.use(cors({ origin: new URL(env.FRONTEND_URL).origin, credentials: true }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 600,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
    })
  );

  // Public: also tells the frontend the configured upload limits.
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', limits: { maxFileSize: env.MAX_FILE_SIZE, maxFiles: env.MAX_FILES } });
  });

  app.use(express.json({ limit: '100kb' }));
  app.use(createSessionMiddleware());
  app.use(csrfProtection);

  app.use('/api/auth', authRoutes);
  app.use('/api/transcription', transcriptionRoutes);
  app.use('/api', assessmentRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
