import { Pencil } from 'lucide-react';

/** Editable text area for the voice transcription (the user can correct any mistakes). */
export default function TranscriptionEditor({ value, onChange }) {
  return (
    <div>
      <label htmlFor="voiceTranscription" className="label flex items-center gap-1.5">
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Voice transcription (editable)
      </label>
      <textarea
        id="voiceTranscription"
        rows={5}
        maxLength={5000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        placeholder="Your transcribed words will appear here. Please check and correct them before continuing."
      />
      <p className="hint">Speech recognition can make mistakes – especially with medical terms and numbers.</p>
    </div>
  );
}
