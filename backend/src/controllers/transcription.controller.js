import { asyncHandler } from '../middleware/error.middleware.js';
import { transcribe } from '../services/transcription.service.js';

export const transcribeAudio = asyncHandler(async (req, res) => {
  const transcription = await transcribe(req.file, req.audioType);
  res.json({ success: true, transcription });
});
