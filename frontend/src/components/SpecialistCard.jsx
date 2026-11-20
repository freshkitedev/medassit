import { UserRoundSearch } from 'lucide-react';

export default function SpecialistCard({ specialist }) {
  if (!specialist?.recommended) {
    return <p className="text-sm text-navy-700">No specific specialist referral was suggested. Start with a general physician if symptoms persist.</p>;
  }
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 p-4">
      <UserRoundSearch className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
      <div className="text-sm">
        <p className="text-base font-semibold text-navy-950">{specialist.specialty}</p>
        {specialist.reason && <p className="mt-1 text-navy-700">{specialist.reason}</p>}
        {specialist.urgency && (
          <p className="mt-2">
            <span className="font-semibold">Suggested timing: </span>
            {specialist.urgency}
          </p>
        )}
      </div>
    </div>
  );
}
