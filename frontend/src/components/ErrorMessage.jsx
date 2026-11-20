import { AlertCircle } from 'lucide-react';

/** details: [{ filename?, field?, message }] */
export default function ErrorMessage({ message, details = [], className = '' }) {
  if (!message) return null;
  return (
    <div role="alert" className={`flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 ${className}`}>
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium">{message}</p>
        {details.length > 0 && (
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {details.map((d, i) => (
              <li key={i}>
                {(d.filename || d.field) && <strong>{d.filename || d.field}: </strong>}
                {d.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
