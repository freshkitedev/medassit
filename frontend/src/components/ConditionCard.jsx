export default function ConditionCard({ condition }) {
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-navy-950">{condition.name}</h3>
        {condition.likelihoodDescription && (
          <span className="badge bg-slate-100 text-navy-700">{condition.likelihoodDescription}</span>
        )}
      </div>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-navy-500">Possible cause – not a confirmed diagnosis</p>
      {condition.explanation && <p className="mt-2 text-sm text-navy-700">{condition.explanation}</p>}
      {condition.supportingSymptoms?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-navy-500">Supporting symptoms</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
            {condition.supportingSymptoms.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      {condition.limitations?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-navy-500">Limitations</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-navy-700">
            {condition.limitations.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
}
