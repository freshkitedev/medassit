import { useCallback, useEffect, useRef, useState } from 'react';

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

const pickMimeType = () => MIME_CANDIDATES.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) ?? '';

function describeError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Microphone access was blocked. Allow microphone permission in your browser and try again.';
    case 'NotFoundError':
      return 'No microphone was found on this device.';
    case 'NotReadableError':
      return 'The microphone is in use by another application.';
    default:
      return 'Could not start recording. Please try again or type the symptoms instead.';
  }
}

/** status: idle | recording | paused | recorded */
export function useAudioRecorder({ maxSeconds = 300 } = {}) {
  const [status, setStatus] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState('');

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const supported =
    typeof window !== 'undefined' && Boolean(window.MediaRecorder) && Boolean(navigator.mediaDevices?.getUserMedia);
  const canPause = supported && typeof window.MediaRecorder.prototype.pause === 'function';

  const clearTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };
  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };
  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const discard = useCallback(() => {
    setAudioUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    setBlob(null);
    setSeconds(0);
  }, []);

  const start = useCallback(async () => {
    setError('');
    if (!supported) {
      setError('Voice recording is not supported in this browser. Please type the symptoms instead.');
      return;
    }
    try {
      discard();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const out = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
        chunksRef.current = [];
        clearTimer();
        releaseStream();
        if (out.size === 0) {
          setError('Nothing was recorded. Please try again.');
          setStatus('idle');
          return;
        }
        setBlob(out);
        setAudioUrl(URL.createObjectURL(out));
        setStatus('recorded');
      };
      recorder.onerror = () => {
        clearTimer();
        releaseStream();
        setError('Recording failed. Please try again.');
        setStatus('idle');
      };
      recorderRef.current = recorder;
      recorder.start(1000);
      setStatus('recording');
      startTimer();
    } catch (err) {
      releaseStream();
      setError(describeError(err));
      setStatus('idle');
    }
  }, [supported, discard]);

  const stop = useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state !== 'inactive') r.stop();
  }, []);

  const pause = useCallback(() => {
    const r = recorderRef.current;
    if (r?.state === 'recording' && canPause) {
      r.pause();
      clearTimer();
      setStatus('paused');
    }
  }, [canPause]);

  const resume = useCallback(() => {
    const r = recorderRef.current;
    if (r?.state === 'paused') {
      r.resume();
      startTimer();
      setStatus('recording');
    }
  }, []);

  const reset = useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state !== 'inactive') {
      r.onstop = null;
      r.stop();
    }
    clearTimer();
    releaseStream();
    discard();
    setError('');
    setStatus('idle');
  }, [discard]);

  // Auto-stop at the maximum duration.
  useEffect(() => {
    if (status === 'recording' && seconds >= maxSeconds) stop();
  }, [status, seconds, maxSeconds, stop]);

  // Release the microphone if the component unmounts mid-recording.
  useEffect(
    () => () => {
      const r = recorderRef.current;
      if (r && r.state !== 'inactive') {
        r.onstop = null;
        r.stop();
      }
      clearTimer();
      releaseStream();
    },
    []
  );

  return { supported, canPause, status, seconds, blob, audioUrl, error, start, stop, pause, resume, reset };
}
