import { Pill } from 'lucide-react';

export default function MedicationInfoCard({ medication }) {
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <h3 className="flex items-center gap-2 font-semibold text-navy-950">
        <Pill className="h-4 w-4 text-brand-600" aria-hidden="true" />
        {medication.name}
      </h3>
      {medication.purpose && <p className="mt-1 text-sm text-navy-700">{medication.purpose}</p>}
      <List title="Precautions" items={medication.precautions} />
      <List title="Contraindications" items={medication.contraindications} />
      <p className="mt-3 text-xs font-medium text-amber-800">
        {medication.requiresProfessionalConfirmation
          ? 'Confirm with a doctor or pharmacist before use.'
          : 'Still check with a pharmacist if you take other medicines.'}
      </p>
    </article>
  );
}

function List({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-navy-500">{title}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}
