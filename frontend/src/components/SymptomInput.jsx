import { Field } from './PatientForm.jsx';
import VoiceRecorder from './VoiceRecorder.jsx';
import TranscriptionEditor from './TranscriptionEditor.jsx';
import { symptomRules } from '../utils/validation.js';

const PLACEHOLDER =
  'Describe the symptoms the patient is experiencing. Include when the symptoms started, their severity, duration, and any factors that make them better or worse.';

export default function SymptomInput({ register, errors, watch, setValue, trigger }) {
  const transcription = watch('voiceTranscription') ?? '';

  const setTranscription = (text) => {
    setValue('voiceTranscription', text, { shouldDirty: true });
    trigger('symptoms');
  };

  // New recordings are appended so earlier (possibly edited) text is never lost.
  const handleTranscribed = (text) => setTranscription(transcription.trim() ? `${transcription.trim()}\n\n${text}` : text);

  return (
    <section className="card space-y-5">
      <h2 className="section-title">Symptoms</h2>

      <Field label="Describe the symptoms" htmlFor="symptoms" error={errors.symptoms} required hint="Include location, duration, severity, frequency, associated symptoms and anything that helps or worsens them.">
        <textarea
          id="symptoms"
          rows={7}
          placeholder={PLACEHOLDER}
          className={`input ${errors.symptoms ? 'input-error' : ''}`}
          {...register('symptoms', symptomRules)}
        />
      </Field>

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-navy-500">
        <span className="h-px flex-1 bg-slate-200" /> or add by voice <span className="h-px flex-1 bg-slate-200" />
      </div>

      <VoiceRecorder onTranscribed={handleTranscribed} />

      {(transcription || errors.voiceTranscription) && <TranscriptionEditor value={transcription} onChange={setTranscription} />}
    </section>
  );
}
