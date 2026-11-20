import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { env } from './env.js';

export const SESSION_COOKIE_NAME = 'mediscan.sid';

export function cookieOptions() {
  return {
    httpOnly: true,
    // SameSite=None requires Secure; browsers reject it otherwise.
    secure: env.isProd || env.COOKIE_SAMESITE === 'none',
    sameSite: env.COOKIE_SAMESITE,
    maxAge: env.SESSION_MAX_AGE,
    path: '/',
  };
}

/** Must be called after the Mongoose connection is established. */
export function createSessionMiddleware() {
  const store = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'sessions',
    ttl: Math.floor(env.SESSION_MAX_AGE / 1000),
    touchAfter: 60,
  });

  return session({
    name: SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // no cookie until the user logs in
    rolling: false, // absolute expiry, no silent extension
    store,
    cookie: cookieOptions(),
  });
}
