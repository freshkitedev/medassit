import api from './api.js';

export async function transcribeAudio(blob) {
  const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
  const form = new FormData();
  form.append('audio', blob, `recording.${ext}`);
  const { data } = await api.post('/transcription', form, { timeout: 120_000 });
  return data.transcription;
}
