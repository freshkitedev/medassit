import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { AppError } from '../middleware/error.middleware.js';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verifies signature, expiry, issuer and audience (our client id) of a Google ID
 * token, and requires a verified email. Only server-verified claims are used.
 */
export async function verifyGoogleCredential(credential) {
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw new AppError(401, 'INVALID_CREDENTIAL', 'Google sign-in could not be verified. Please try again.');
  }
  if (!payload?.sub || !payload.email) {
    throw new AppError(401, 'INVALID_CREDENTIAL', 'Google sign-in could not be verified. Please try again.');
  }
  if (!payload.email_verified) {
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Your Google account email must be verified to use MediScan AI.');
  }
  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email,
    picture: payload.picture || '',
    emailVerified: true,
  };
}

export async function findOrCreateUser(profile) {
  const now = new Date();
  // Existing user: refresh profile + last login. New user: create.
  return User.findOneAndUpdate(
    { googleId: profile.googleId },
    { $set: { ...profile, lastLoginAt: now } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

export const toPublicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, picture: u.picture });
