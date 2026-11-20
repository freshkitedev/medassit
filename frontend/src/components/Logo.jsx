import { HeartPulse } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const box = size === 'lg' ? 'h-14 w-14' : 'h-9 w-9';
  const icon = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  return (
    <span className="flex items-center gap-2.5">
      <span className={`${box} flex items-center justify-center rounded-xl bg-brand-600 text-white`}>
        <HeartPulse className={icon} aria-hidden="true" />
      </span>
      <span className={`font-bold tracking-tight text-navy-950 ${size === 'lg' ? 'text-3xl' : 'text-lg'}`}>
        MediScan <span className="text-brand-600">AI</span>
      </span>
    </span>
  );
}
