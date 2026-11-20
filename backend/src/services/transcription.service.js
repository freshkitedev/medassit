import { transcribeAudioBuffer } from './openai.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { sanitizeText } from '../utils/validators.js';

export async function transcribe(file, audioType) {
  const text = sanitizeText(await transcribeAudioBuffer(file.buffer, audioType));
  if (!text) {
    throw new AppError(422, 'NO_SPEECH', 'No speech was detected in the recording. Please try again or type the symptoms.');
  }
  return text;
}
