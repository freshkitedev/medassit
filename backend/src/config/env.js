import 'dotenv/config';
import { z } from 'zod';

// Treat empty values in .env (e.g. `MAX_FILES=`) as "not set" so defaults apply.
const raw = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ''));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1),
  OPENAI_TRANSCRIPTION_MODEL: z.string().min(1),
  OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(90_000),
  GOOGLE_CLIENT_ID: z.string().min(1),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters'),
  SESSION_MAX_AGE: z.coerce.number().int().positive().default(8 * 60 * 60 * 1000), // ms
  // Unset: 'none' in production (API and SPA are normally on different sites, e.g. two *.onrender.com
  // hosts, which count as cross-site), 'lax' in development. CSRF token + Origin check still apply.
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).optional(),
  // Behind a reverse proxy (Render, Heroku, nginx…). Unset: on in production or on Render.
  TRUST_PROXY: z.enum(['true', 'false']).optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(10 * 1024 * 1024), // bytes per PDF
  MAX_FILES: z.coerce.number().int().positive().default(5),
  MAX_AUDIO_SIZE: z.coerce.number().int().positive().default(25 * 1024 * 1024), // OpenAI limit
  MAX_PDF_PAGES: z.coerce.number().int().positive().default(60),
});

const parsed = schema.safeParse(raw);
if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`Invalid or missing environment variables:\n${problems}\nSee backend/.env.example`);
  process.exit(1);
}

const isProd = parsed.data.NODE_ENV === 'production';

export const env = Object.freeze({
  ...parsed.data,
  isProd,
  COOKIE_SAMESITE: parsed.data.COOKIE_SAMESITE ?? (isProd ? 'none' : 'lax'),
  trustProxy: parsed.data.TRUST_PROXY ? parsed.data.TRUST_PROXY === 'true' : isProd || Boolean(process.env.RENDER),
});
