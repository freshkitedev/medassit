import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { History, PlusCircle } from 'lucide-react';
import { getAssessment } from '../services/assessmentService.js';
import { toApiError } from '../services/api.js';
import AssessmentReport from '../components/AssessmentReport.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

/** Shown right after a new assessment is created (also reachable later by id). */
export default function AssessmentResult() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAssessment(id).then(setAssessment).catch((e) => setError(toApiError(e).message));
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!assessment) return <LoadingScreen fullScreen={false} message="Loading assessment…" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Preliminary assessment</h1>
          <p className="text-sm text-navy-500">Saved to your assessment history.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/assessments" className="btn-secondary"><History className="h-4 w-4" /> History</Link>
          <Link to="/assessments/new" className="btn-primary"><PlusCircle className="h-4 w-4" /> New</Link>
        </div>
      </div>
      <AssessmentReport assessment={assessment} />
    </div>
  );
}
