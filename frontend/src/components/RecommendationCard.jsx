import { Activity, FlaskConical, HeartHandshake, Stethoscope } from 'lucide-react';

const CATEGORY = {
  SELF_CARE: { label: 'Self-care', icon: HeartHandshake },
  MEDICAL_CONSULTATION: { label: 'Medical consultation', icon: Stethoscope },
  TESTING: { label: 'Additional testing', icon: FlaskConical },
  LIFESTYLE: { label: 'Lifestyle', icon: Activity },
};

export default function RecommendationCard({ item }) {
  const meta = CATEGORY[item.category] ?? CATEGORY.SELF_CARE;
  const Icon = meta.icon;
  return (
    <article className="flex gap-3 rounded-xl border border-slate-200 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">{meta.label}</p>
        <p className="mt-0.5 font-medium text-navy-950">{item.recommendation}</p>
        {item.reason && <p className="mt-1 text-sm text-navy-700">{item.reason}</p>}
      </div>
    </article>
  );
}
