import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, ClipboardList, Clock, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { listAssessments } from '../services/assessmentService.js';
import { toApiError } from '../services/api.js';
import { formatDate } from '../utils/formatting.js';
import Avatar from '../components/Avatar.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { UrgencyBadge } from '../components/UrgencyCard.jsx';
import DisclaimerCard from '../components/DisclaimerCard.jsx';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div>
        <p className="text-xs text-navy-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listAssessments({ limit: 5 }).then(setData).catch((e) => setError(toApiError(e).message));
  }, []);

  const recent = data?.items ?? [];
  const attention = recent.filter((a) => a.urgencyLevel === 'EMERGENCY' || a.urgencyLevel === 'URGENT').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar user={user} size="h-14 w-14" />
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
            <p className="text-sm text-navy-500">Organise symptoms and reports for a preliminary AI assessment.</p>
          </div>
        </div>
        <Link to="/assessments/new" className="btn-primary"><PlusCircle className="h-4 w-4" /> New assessment</Link>
      </div>

      <ErrorMessage message={error} />
      {!data && !error && <LoadingScreen fullScreen={false} message="Loading your assessments…" />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={ClipboardList} label="Total assessments" value={data.total} />
            <StatCard icon={Clock} label="Latest assessment" value={recent[0] ? formatDate(recent[0].createdAt, false) : '—'} />
            <StatCard icon={Activity} label="Urgent / emergency (recent 5)" value={attention} />
          </div>

          <section className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="section-title !mb-0">Recent assessments</h2>
              <Link to="/assessments" className="flex items-center gap-1 text-sm font-medium text-brand-700">View all <ArrowRight className="h-4 w-4" /></Link>
            </div>
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-navy-500">No assessments yet. Start your first one with “New assessment”.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((a) => (
                  <li key={a.id}>
                    <Link to={`/assessments/${a.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-slate-50">
                      <div>
                        <p className="font-medium">{a.patientName}</p>
                        <p className="text-xs text-navy-500">{a.age} yrs · {a.gender} · {formatDate(a.createdAt)}</p>
                      </div>
                      <UrgencyBadge level={a.urgencyLevel} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
      <DisclaimerCard />
    </div>
  );
}
