import { z } from 'zod';
import { GENDERS, LIMITS } from '../constants/medical.constants.js';

/** Strip control characters (keeping \n and \t), normalise newlines and trim. */
export function sanitizeText(value) {
  return String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim();
}

const text = (max) => z.preprocess((v) => sanitizeText(v), z.string().max(max, `Must be at most ${max} characters`));
const optionalText = (max) => z.preprocess((v) => sanitizeText(v), z.string().max(max, `Must be at most ${max} characters`)).default('');

export const googleLoginSchema = z.object({
  credential: z.string().min(20).max(5000),
});

export const assessmentInputSchema = z
  .object({
    patientName: text(LIMITS.name).pipe(z.string().min(1, 'Patient name is required')),
    age: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z.coerce.number({ error: 'Age must be a number' }).min(0, 'Age cannot be negative').max(120, 'Age must be 120 or less')
    ),
    gender: z.enum(GENDERS, { error: 'Please select a valid gender option' }),
    symptoms: optionalText(LIMITS.longText),
    voiceTranscription: optionalText(LIMITS.longText),
    medicalConditions: optionalText(LIMITS.shortText),
    medicalHistory: optionalText(LIMITS.shortText),
    currentMedications: optionalText(LIMITS.shortText),
    allergies: optionalText(LIMITS.shortText),
    consent: z.preprocess((v) => v === true || v === 'true', z.literal(true, { error: 'Consent is required to continue' })),
  })
  .refine((d) => `${d.symptoms}${d.voiceTranscription}`.length >= 3, {
    path: ['symptoms'],
    message: 'Please describe the symptoms (typed or from the voice transcription)',
  });

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export { escapeRegex };

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  q: z.preprocess((v) => sanitizeText(v).slice(0, 100), z.string()).default(''),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

export const objectIdParamSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id') });

/* ----- Magic-byte checks (do not trust extensions / MIME types) ----- */

export const isPdfBuffer = (buf) => Boolean(buf) && buf.length > 8 && buf.subarray(0, 1024).includes('%PDF-');

export function detectAudioType(buf) {
  if (!buf || buf.length < 12) return null;
  const ascii = (s, e) => buf.toString('latin1', s, e);
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return { ext: 'webm', mime: 'audio/webm' };
  if (ascii(0, 4) === 'OggS') return { ext: 'ogg', mime: 'audio/ogg' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return { ext: 'wav', mime: 'audio/wav' };
  if (ascii(4, 8) === 'ftyp') return { ext: 'm4a', mime: 'audio/mp4' };
  if (ascii(0, 4) === 'fLaC') return { ext: 'flac', mime: 'audio/flac' };
  if (ascii(0, 3) === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) return { ext: 'mp3', mime: 'audio/mpeg' };
  return null;
}
