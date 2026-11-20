import { verifyGoogleCredential, findOrCreateUser, toPublicUser } from '../services/auth.service.js';
import { SESSION_COOKIE_NAME, cookieOptions } from '../config/session.js';
import { newCsrfToken } from '../middleware/csrf.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const promisify = (fn) => new Promise((resolve, reject) => fn((err) => (err ? reject(err) : resolve())));

export const googleLogin = asyncHandler(async (req, res) => {
  const profile = await verifyGoogleCredential(req.body.credential);
  const user = await findOrCreateUser(profile);

  // New session id on login prevents session fixation.
  await promisify((cb) => req.session.regenerate(cb));
  req.session.userId = String(user._id);
  req.session.csrfToken = newCsrfToken();
  await promisify((cb) => req.session.save(cb));

  res.json({ success: true, user: toPublicUser(user), csrfToken: req.session.csrfToken });
});

export const me = (req, res) => {
  res.json({ authenticated: true, user: toPublicUser(req.user), csrfToken: req.session.csrfToken });
};

export const logout = asyncHandler(async (req, res) => {
  await promisify((cb) => req.session.destroy(cb));
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions());
  res.json({ success: true });
});
