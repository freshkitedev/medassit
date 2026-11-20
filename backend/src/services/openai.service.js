import { toFile } from 'openai';
import { openai } from '../config/openai.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';

/** Ask the model for a JSON document matching `jsonSchema`. Returns the raw text. */
export async function generateStructuredJson({ system, user, schemaName, jsonSchema }) {
  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: schemaName, strict: true, schema: jsonSchema },
    },
  });

  const choice = completion.choices?.[0];
  if (!choice || choice.message?.refusal) {
    throw new AppError(502, 'AI_REFUSED', 'The AI could not produce an assessment for this input.');
  }
  if (choice.finish_reason === 'length') {
    throw new AppError(502, 'AI_TRUNCATED', 'The AI response was cut off. Try with fewer or shorter reports.');
  }
  return choice.message.content;
}

export async function transcribeAudioBuffer(buffer, { ext, mime }) {
  const file = await toFile(buffer, `recording.${ext}`, { type: mime });
  const result = await openai.audio.transcriptions.create({
    file,
    model: env.OPENAI_TRANSCRIPTION_MODEL,
  });
  return result.text ?? '';
}
