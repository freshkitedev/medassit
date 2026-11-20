import OpenAI from 'openai';
import { env } from './env.js';

// The API key lives only on the server and is never sent to the frontend.
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: env.OPENAI_TIMEOUT_MS,
  maxRetries: 1,
});
