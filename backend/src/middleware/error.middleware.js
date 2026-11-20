import multer from 'multer';
import OpenAI from 'openai';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Resource not found.' });
}

function mapKnownError(err) {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    return new AppError(
      400,
      'VALIDATION_ERROR',
      'Some of the information provided is invalid.',
      err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))
    );
  }

  if (err instanceof multer.MulterError) {
    const map = {
      LIMIT_FILE_SIZE: [413, 'FILE_TOO_LARGE', 'A file exceeds the maximum allowed size.'],
      LIMIT_FILE_COUNT: [400, 'TOO_MANY_FILES', `You can upload at most ${env.MAX_FILES} files.`],
      LIMIT_UNEXPECTED_FILE: [400, 'UNEXPECTED_FILE', 'Unexpected file field in the upload.'],
    };
    const [status, code, message] = map[err.code] ?? [400, 'UPLOAD_ERROR', 'The upload could not be processed.'];
    return new AppError(status, code, message);
  }

  // OpenAI SDK errors expose `status`; timeouts have a recognisable name.
  if (err?.name === 'APIConnectionTimeoutError') {
    return new AppError(504, 'AI_TIMEOUT', 'The AI service took too long to respond. Please try again.');
  }
  if (err?.name === 'APIConnectionError') {
    return new AppError(502, 'AI_UNAVAILABLE', 'Could not reach the AI service. Please try again shortly.');
  }
  if (err instanceof OpenAI.APIError) {
    if (err.status === 429) {
      return new AppError(429, 'AI_RATE_LIMIT', 'The AI service is busy right now. Please try again in a minute.');
    }
    if (err.status === 400 && /audio/i.test(String(err.message))) {
      return new AppError(422, 'AUDIO_UNREADABLE', 'The audio could not be read. Try recording again.');
    }
    return new AppError(502, 'AI_ERROR', 'The AI service returned an error. Please try again.');
  }

  if (err?.type === 'entity.parse.failed') return new AppError(400, 'BAD_JSON', 'Malformed request body.');
  if (err?.type === 'entity.too.large') return new AppError(413, 'BODY_TOO_LARGE', 'Request body is too large.');
  if (err?.name === 'CastError') return new AppError(400, 'INVALID_ID', 'Invalid identifier.');
  if (err?.code === 11000) return new AppError(409, 'CONFLICT', 'A conflicting record already exists.');
  if (err?.name === 'MongoServerSelectionError' || err?.name === 'MongooseServerSelectionError') {
    return new AppError(503, 'DB_UNAVAILABLE', 'The database is temporarily unavailable.');
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const known = mapKnownError(err);
  const appErr = known ?? new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');

  // Log technical metadata only. Error messages from validation/DB layers can echo
  // submitted values, so patient data must never be written to logs.
  if (appErr.status >= 500) {
    console.error(`[error] ${req.method} ${req.path} -> ${appErr.status} ${appErr.code} (${err?.name ?? 'Error'})`);
  }

  res.status(appErr.status).json({
    success: false,
    code: appErr.code,
    message: appErr.message,
    ...(appErr.details ? { details: appErr.details } : {}),
  });
}
