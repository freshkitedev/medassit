import { FileText, Sparkles } from 'lucide-react';

export default function ReportFindingCard({ finding }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm">
        <FileText className="h-4 w-4 text-navy-500" aria-hidden="true" />
        <span className="font-medium">{finding.reportName}</span>
      </div>
      <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
        <div className="bg-white p-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-navy-500">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Stated in the report
          </p>
          <dl className="space-y-1.5 text-sm">
            <Row label="Test" value={finding.testName} />
            <Row label="Observed value" value={finding.observedValue} />
            <Row label="Reference range" value={finding.referenceRange || 'Not stated in report'} />
            {finding.finding && <Row label="Finding" value={finding.finding} />}
          </dl>
        </div>
        <div className="bg-brand-50/50 p-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI interpretation
          </p>
          <dl className="space-y-1.5 text-sm">
            <Row label="Interpretation" value={finding.interpretation} />
            <Row label="Potential significance" value={finding.significance} />
            <Row label="Follow-up" value={finding.requiresFollowUp ? 'Discuss with a healthcare professional' : 'No specific follow-up flagged'} />
          </dl>
        </div>
      </div>
    </article>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-navy-500">{label}</dt>
      <dd className="font-medium text-navy-900">{value}</dd>
    </div>
  );
}
