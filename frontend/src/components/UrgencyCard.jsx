import { CalendarCheck, Home, Siren, Stethoscope } from 'lucide-react';

// Level is conveyed by text + icon + colour (never colour alone).
export const URGENCY_META = {
  EMERGENCY: {
    label: 'Emergency',
    icon: Siren,
    card: 'border-red-600 bg-red-50 text-red-900',
    badge: 'bg-red-600 text-white',
    headline: 'Seek emergency care immediately',
    guidance:
      'Call your local emergency number now (112 in India) or go to the nearest emergency department. Do not wait and do not rely on home treatment.',
  },
  URGENT: {
    label: 'Urgent',
    icon: Stethoscope,
    card: 'border-orange-500 bg-orange-50 text-orange-900',
    badge: 'bg-orange-500 text-white',
    headline: 'Urgent medical evaluation recommended',
    guidance: 'Arrange to be seen by a healthcare professional as soon as possible, ideally within 24 hours.',
  },
  ROUTINE: {
    label: 'Routine',
    icon: CalendarCheck,
    card: 'border-blue-400 bg-blue-50 text-blue-900',
    badge: 'bg-blue-600 text-white',
    headline: 'Arrange a medical appointment',
    guidance: 'Book a consultation with a healthcare professional in the coming days to discuss these symptoms.',
  },
  SELF_CARE: {
    label: 'Self-care',
    icon: Home,
    card: 'border-emerald-400 bg-emerald-50 text-emerald-900',
    badge: 'bg-emerald-600 text-white',
    headline: 'General self-care may be appropriate',
    guidance: 'Follow the self-care guidance below and seek medical advice if symptoms worsen, persist, or new warning signs appear.',
  },
};

export function UrgencyBadge({ level }) {
  const meta = URGENCY_META[level] ?? URGENCY_META.ROUTINE;
  const Icon = meta.icon;
  return (
    <span className={`badge ${meta.badge}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export default function UrgencyCard({ level, message }) {
  const meta = URGENCY_META[level] ?? URGENCY_META.ROUTINE;
  const Icon = meta.icon;
  const isEmergency = level === 'EMERGENCY';
  return (
    <section
      role={isEmergency ? 'alert' : 'region'}
      aria-label={`Urgency: ${meta.label}`}
      className={`rounded-2xl border-2 p-5 ${meta.card} ${isEmergency ? 'shadow-lg ring-4 ring-red-200' : ''}`}
    >
      <div className="flex items-start gap-4">
        <Icon className={`shrink-0 ${isEmergency ? 'h-10 w-10' : 'h-8 w-8'}`} aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">Urgency level: {meta.label}</p>
          <h2 className={`font-bold ${isEmergency ? 'text-2xl' : 'text-xl'}`}>{meta.headline}</h2>
          <p className="mt-1 text-sm">{meta.guidance}</p>
          {message && <p className="mt-2 text-sm font-semibold">{message}</p>}
        </div>
      </div>
    </section>
  );
}
