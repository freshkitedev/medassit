import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from './error.middleware.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const newCsrfToken = () => crypto.randomBytes(32).toString('hex');

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/**
 * CSRF protection for cookie-session auth:
 *  1. Origin check on every state-changing request (when the browser sends one).
 *  2. Synchroniser token: the token lives in the server-side session and must be
 *     echoed in the X-CSRF-Token header. Only the login endpoint is exempt, since
 *     no session exists yet (it is protected by the Google-signed credential).
 */
export function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin && origin !== new URL(env.FRONTEND_URL).origin) {
    return next(new AppError(403, 'BAD_ORIGIN', 'Request origin not allowed.'));
  }

  if (req.path === '/api/auth/google') return next();

  const expected = req.session?.csrfToken;
  const supplied = req.get('x-csrf-token');
  if (!expected || !supplied || !safeEqual(expected, supplied)) {
    return next(new AppError(403, 'BAD_CSRF', 'Security token missing or invalid. Please refresh the page.'));
  }
  next();
}
