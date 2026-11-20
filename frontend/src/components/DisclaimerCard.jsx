import { ShieldAlert } from 'lucide-react';

export const FULL_DISCLAIMER =
  'AI-generated information is intended for preliminary health information and educational purposes. It is not a confirmed diagnosis and does not replace examination, diagnosis, or treatment by a qualified healthcare professional.';

export default function DisclaimerCard({ className = '' }) {
  return (
    <div className={`flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 ${className}`}>
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">Medical disclaimer</p>
        <p className="mt-0.5">{FULL_DISCLAIMER}</p>
      </div>
    </div>
  );
}
