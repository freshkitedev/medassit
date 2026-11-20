import { User } from '../models/user.model.js';
import { AppError, asyncHandler } from './error.middleware.js';
import { SESSION_COOKIE_NAME, cookieOptions } from '../config/session.js';

/** Rejects unauthenticated requests and attaches the session's user to req.user. */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const userId = req.session?.userId;
  if (!userId) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    // Account removed since login: kill the stale session.
    await new Promise((resolve) => req.session.destroy(resolve));
    res.clearCookie(SESSION_COOKIE_NAME, cookieOptions());
    throw new AppError(401, 'SESSION_EXPIRED', 'Your session has expired. Please sign in again.');
  }

  req.user = user;
  next();
});
