import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { deleteAssessment, getAssessment } from '../services/assessmentService.js';
import { toApiError } from '../services/api.js';
import { loadSettings } from '../utils/settings.js';
import { formatFileSize } from '../utils/formatting.js';
import AssessmentReport from '../components/AssessmentReport.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

function Item({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-navy-500">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm">{value}</dd>
    </div>
  );
}

export default function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAssessment(id).then(setAssessment).catch((e) => setError(toApiError(e).message));
  }, [id]);

  const handleDelete = async () => {
    if (loadSettings().confirmDelete && !window.confirm('Delete this assessment permanently? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteAssessment(id);
      navigate('/assessments', { replace: true });
    } catch (e) {
      setError(toApiError(e).message);
      setDeleting(false);
    }
  };

  if (!assessment) {
    return error ? (
      <div className="space-y-4">
        <ErrorMessage message={error} />
        <Link to="/assessments" className="btn-secondary"><ArrowLeft className="h-4 w-4" /> Back to history</Link>
      </div>
    ) : (
      <LoadingScreen fullScreen={false} message="Loading assessment…" />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/assessments" className="btn-secondary"><ArrowLeft className="h-4 w-4" /> Back to history</Link>
        <button className="btn-ghost text-red-700" onClick={handleDelete} disabled={deleting}><Trash2 className="h-4 w-4" /> Delete</button>
      </div>
      <ErrorMessage message={error} />

      <AssessmentReport assessment={assessment} />

      <section className="card">
        <h2 className="section-title">Original information submitted</h2>
        <dl className="space-y-3">
          <Item label="Symptoms" value={assessment.symptoms} />
          <Item label="Voice transcription" value={assessment.voiceTranscription} />
          <Item label="Medical conditions" value={assessment.medicalConditions} />
          <Item label="Current medications" value={assessment.currentMedications} />
          <Item label="Allergies" value={assessment.allergies} />
          <Item label="Other history" value={assessment.medicalHistory} />
        </dl>
        {assessment.reports?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-navy-500">Reports analysed</p>
            <ul className="mt-1 space-y-1 text-sm">
              {assessment.reports.map((r) => (
                <li key={r.filename} className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {r.filename} <span className="text-navy-500">({formatFileSize(r.size)}, {r.pageCount} pages)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
