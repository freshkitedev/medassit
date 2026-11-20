import {
  AlertTriangle, ClipboardList, FileSearch, HelpCircle, ListChecks, Pill, Stethoscope, User, Brain,
} from 'lucide-react';
import UrgencyCard from './UrgencyCard.jsx';
import ConditionCard from './ConditionCard.jsx';
import ReportFindingCard from './ReportFindingCard.jsx';
import RecommendationCard from './RecommendationCard.jsx';
import MedicationInfoCard from './MedicationInfoCard.jsx';
import SpecialistCard from './SpecialistCard.jsx';
import FollowUpQuestions from './FollowUpQuestions.jsx';
import DisclaimerCard from './DisclaimerCard.jsx';
import { formatDate } from '../utils/formatting.js';

function Section({ icon: Icon, title, children, note }) {
  return (
    <section className="card">
      <h2 className="section-title">
        <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
        {title}
      </h2>
      {note && <p className="mb-3 text-sm font-medium text-amber-800">{note}</p>}
      {children}
    </section>
  );
}

/** Renders all sections (A–K) of a saved assessment. */
export default function AssessmentReport({ assessment }) {
  const ai = assessment.aiAssessment;
  const emergency = ai.emergencyLevel === 'EMERGENCY';
  const urgency = <UrgencyCard level={ai.emergencyLevel} message={ai.emergencyMessage} />;

  return (
    <div className="space-y-5">
      {/* Emergency alert is always the first thing on the page. */}
      {emergency && urgency}

      <Section icon={User} title="Patient details">
        <dl className="grid gap-4 text-sm sm:grid-cols-4">
          <Field label="Name" value={assessment.patientName} />
          <Field label="Age" value={`${assessment.age} years`} />
          <Field label="Gender" value={assessment.gender} />
          <Field label="Assessment date" value={formatDate(assessment.createdAt)} />
        </dl>
      </Section>

      {!emergency && urgency}

      <Section icon={ClipboardList} title="Assessment summary">
        <p className="text-sm leading-relaxed text-navy-800">{ai.assessmentSummary}</p>
        {ai.limitations?.length > 0 && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-semibold">Important limitations</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-navy-700">
              {ai.limitations.slice(0, 3).map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        )}
      </Section>

      <Section icon={Brain} title="Possible conditions" note="These are possible causes to discuss with a clinician, not confirmed diagnoses.">
        {ai.possibleConditions.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {ai.possibleConditions.map((c, i) => <ConditionCard key={i} condition={c} />)}
          </div>
        ) : (
          <p className="text-sm text-navy-500">No specific conditions were suggested from the information provided.</p>
        )}
      </Section>

      {ai.reportFindings.length > 0 && (
        <Section icon={FileSearch} title="Report findings">
          <div className="space-y-3">
            {ai.reportFindings.map((f, i) => <ReportFindingCard key={i} finding={f} />)}
          </div>
        </Section>
      )}

      <Section icon={ListChecks} title="Recommendations">
        <div className="space-y-3">
          {ai.recommendations.map((r, i) => <RecommendationCard key={i} item={r} />)}
          {!ai.recommendations.length && <p className="text-sm text-navy-500">No recommendations were provided.</p>}
        </div>
      </Section>

      {ai.medicationInformation.length > 0 && (
        <Section icon={Pill} title="Medication Information – Not a Prescription" note="General information only. Do not start, stop or combine medicines without professional advice.">
          <div className="grid gap-3 md:grid-cols-2">
            {ai.medicationInformation.map((m, i) => <MedicationInfoCard key={i} medication={m} />)}
          </div>
        </Section>
      )}

      <Section icon={Stethoscope} title="Specialist recommendation">
        <SpecialistCard specialist={ai.specialistRecommendation} />
      </Section>

      <Section icon={HelpCircle} title="Follow-up questions">
        <FollowUpQuestions questions={ai.followUpQuestions} />
      </Section>

      <Section icon={AlertTriangle} title="Limitations">
        {ai.limitations.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-navy-800">
            {ai.limitations.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-navy-500">No additional limitations noted.</p>
        )}
      </Section>

      <DisclaimerCard />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-navy-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
