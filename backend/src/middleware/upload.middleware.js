import multer from 'multer';
import path from 'node:path';
import { env } from '../config/env.js';
import { AppError } from './error.middleware.js';
import { detectAudioType, isPdfBuffer } from '../utils/validators.js';
import { scrubFiles } from '../utils/file-cleanup.js';

// Memory storage: uploads are never written to disk, so there is nothing public
// (or leftover) to clean up. Buffers are zeroed once the request finishes.
const storage = multer.memoryStorage();

const pdfUpload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE, files: env.MAX_FILES, fields: 20, fieldSize: 100 * 1024 },
  fileFilter(req, file, cb) {
    const isPdf = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
    cb(isPdf ? null : new AppError(400, 'INVALID_FILE_TYPE', `"${file.originalname}" is not a PDF file.`), isPdf);
  },
});

const audioUpload = multer({
  storage,
  limits: { fileSize: env.MAX_AUDIO_SIZE, files: 1, fields: 5 },
  fileFilter(req, file, cb) {
    const ok = file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm';
    cb(ok ? null : new AppError(400, 'UNSUPPORTED_AUDIO', 'Unsupported audio format.'), ok);
  },
});

/** Zero the in-memory file buffers when the response is finished or aborted. */
function scrubOnFinish(req, res) {
  const run = () => scrubFiles(req.files ?? (req.file ? [req.file] : []));
  res.once('finish', run);
  res.once('close', run);
}

export const uploadReports = (req, res, next) => {
  scrubOnFinish(req, res);
  pdfUpload.array('reports', env.MAX_FILES)(req, res, next);
};

export const uploadAudio = (req, res, next) => {
  scrubOnFinish(req, res);
  audioUpload.single('audio')(req, res, next);
};

/** Inspect real file content (magic bytes) – the extension / MIME type can be forged. */
export function verifyPdfContent(req, res, next) {
  for (const file of req.files ?? []) {
    if (!isPdfBuffer(file.buffer)) {
      return next(new AppError(400, 'INVALID_FILE_CONTENT', `"${file.originalname}" is not a valid PDF file.`));
    }
  }
  next();
}

export function verifyAudioContent(req, res, next) {
  const file = req.file;
  if (!file) return next(new AppError(400, 'NO_AUDIO', 'No audio file was provided.'));
  if (file.size < 1000) return next(new AppError(400, 'EMPTY_AUDIO', 'The recording is empty. Please record again.'));
  const type = detectAudioType(file.buffer);
  if (!type) return next(new AppError(415, 'UNSUPPORTED_AUDIO', 'Unsupported or corrupt audio format.'));
  req.audioType = type; // { ext, mime }
  next();
}
