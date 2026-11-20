import { useRef, useState } from 'react';
import { Mic, Pause, Play, Square, Trash2, RotateCcw, Loader2, FileText } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import { toApiError } from '../services/api.js';
import { formatDuration } from '../utils/formatting.js';
import ErrorMessage from './ErrorMessage.jsx';

const MAX_SECONDS = 300;

/**
 * Records audio locally. Nothing leaves the device until the user presses
 * "Transcribe recording", which sends the audio to the server for transcription.
 */
export default function VoiceRecorder({ onTranscribed }) {
  const rec = useAudioRecorder({ maxSeconds: MAX_SECONDS });
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [txError, setTxError] = useState('');
  const [done, setDone] = useState(false);

  const isRecording = rec.status === 'recording';
  const isPaused = rec.status === 'paused';
  const hasRecording = rec.status === 'recorded';

  const handleTranscribe = async () => {
    setTxError('');
    setTranscribing(true);
    try {
      const text = await transcribeAudio(rec.blob);
      onTranscribed(text);
      setDone(true);
    } catch (err) {
      setTxError(toApiError(err).message);
    } finally {
      setTranscribing(false);
    }
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  const handleReset = () => {
    rec.reset();
    setDone(false);
    setTxError('');
    setPlaying(false);
  };

  if (!rec.supported) {
    return (
      <p className="rounded-xl bg-slate-50 p-3 text-sm text-navy-700">
        Voice recording isn't supported in this browser. You can type the symptoms above instead.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${isRecording ? 'bg-red-600 text-white' : 'bg-brand-100 text-brand-700'}`}>
          <Mic className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Describe symptoms by voice</p>
          <p className="text-xs text-navy-500" aria-live="polite">
            {isRecording && (
              <span className="font-semibold text-red-700">
                <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-600" aria-hidden="true" />
                Recording… {formatDuration(rec.seconds)}
              </span>
            )}
            {isPaused && `Paused at ${formatDuration(rec.seconds)}`}
            {hasRecording && `Recorded ${formatDuration(rec.seconds)} – not sent yet`}
            {rec.status === 'idle' && `Up to ${MAX_SECONDS / 60} minutes. Audio stays on your device until you choose to transcribe.`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {rec.status === 'idle' && (
          <button type="button" className="btn-primary" onClick={rec.start}>
            <Mic className="h-4 w-4" /> Start recording
          </button>
        )}
        {(isRecording || isPaused) && (
          <>
            {isRecording && rec.canPause && (
              <button type="button" className="btn-secondary" onClick={rec.pause}><Pause className="h-4 w-4" /> Pause</button>
            )}
            {isPaused && (
              <button type="button" className="btn-secondary" onClick={rec.resume}><Play className="h-4 w-4" /> Resume</button>
            )}
            <button type="button" className="btn-danger" onClick={rec.stop}><Square className="h-4 w-4" /> Stop</button>
          </>
        )}
        {hasRecording && (
          <>
            <button type="button" className="btn-secondary" onClick={togglePlay}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? 'Pause playback' : 'Play'}
            </button>
            <button type="button" className="btn-primary" onClick={handleTranscribe} disabled={transcribing}>
              {transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {transcribing ? 'Transcribing…' : done ? 'Transcribe again' : 'Transcribe recording'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => { handleReset(); rec.start(); }} disabled={transcribing}>
              <RotateCcw className="h-4 w-4" /> Record again
            </button>
            <button type="button" className="btn-ghost text-red-700" onClick={handleReset} disabled={transcribing}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </>
        )}
      </div>

      {rec.audioUrl && (
        <audio
          ref={audioRef}
          src={rec.audioUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}

      {hasRecording && (
        <p className="text-xs text-navy-500" aria-live="polite">
          {transcribing ? 'Sending audio for transcription…' : done ? 'Transcription added below – please review and edit it.' : 'Press "Transcribe recording" to convert this audio to text.'}
        </p>
      )}
      <ErrorMessage message={rec.error || txError} />
    </div>
  );
}
