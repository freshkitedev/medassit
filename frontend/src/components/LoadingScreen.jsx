import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/** Simple spinner. Pass `messages` to rotate descriptive status text (no fake percentages). */
export default function LoadingScreen({ message = 'Loading…', messages, uploadProgress, fullScreen = true }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!messages?.length) return undefined;
    const t = setInterval(() => setIndex((i) => Math.min(i + 1, messages.length - 1)), 3500);
    return () => clearInterval(t);
  }, [messages]);

  const text = messages?.length ? messages[index] : message;
  const uploading = typeof uploadProgress === 'number' && uploadProgress < 100;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        fullScreen ? 'fixed inset-0 z-50 bg-white/90 backdrop-blur-sm' : 'min-h-[40vh]'
      }`}
    >
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" aria-hidden="true" />
      <p className="text-base font-medium text-navy-900">{text}</p>
      {uploading && (
        <div className="w-64">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="mt-1 text-xs text-navy-500">Uploading files… {uploadProgress}%</p>
        </div>
      )}
      {messages?.length > 0 && <p className="max-w-xs text-xs text-navy-500">This can take up to a minute. Please keep this page open.</p>}
    </div>
  );
}
