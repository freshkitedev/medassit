import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, PlusCircle, Search, Trash2 } from 'lucide-react';
import { deleteAssessment, listAssessments } from '../services/assessmentService.js';
import { toApiError } from '../services/api.js';
import { loadSettings } from '../utils/settings.js';
import { formatDate } from '../utils/formatting.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { UrgencyBadge } from '../components/UrgencyCard.jsx';

export default function AssessmentHistory() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await listAssessments({ page, limit: loadSettings().pageSize, q: query, sort }));
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setLoading(false);
    }
  }, [page, query, sort]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (item) => {
    if (loadSettings().confirmDelete && !window.confirm(`Delete the assessment for ${item.patientName}? This cannot be undone.`)) return;
    try {
      await deleteAssessment(item.id);
      // Step back a page if we just removed the last item on it.
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (e) {
      setError(toApiError(e).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Assessment history</h1>
        <Link to="/assessments/new" className="btn-primary"><PlusCircle className="h-4 w-4" /> New assessment</Link>
      </div>

      <div className="card flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" aria-label="Search by patient name" placeholder="Search by patient name" className="input !pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select aria-label="Sort by date" className="input sm:w-48" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <ErrorMessage message={error} />
      {loading && !data && <LoadingScreen fullScreen={false} message="Loading assessments…" />}

      {data && (
        <div className={loading ? 'opacity-60' : ''}>
          {data.items.length === 0 ? (
            <div className="card py-10 text-center text-sm text-navy-500">
              {query ? 'No assessments match your search.' : 'No assessments yet.'}
            </div>
          ) : (
            <ul className="space-y-3">
              {data.items.map((a) => (
                <li key={a.id} className="card !p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{a.patientName}</h2>
                        <UrgencyBadge level={a.urgencyLevel} />
                      </div>
                      <p className="text-xs text-navy-500">{a.age} yrs · {a.gender} · {formatDate(a.createdAt)}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-navy-700">{a.summary}</p>
                    </div>
                    <div className="flex gap-1">
                      <Link to={`/assessments/${a.id}`} className="btn-secondary !px-3"><Eye className="h-4 w-4" /> View</Link>
                      <button className="btn-ghost !px-3 text-red-700" onClick={() => handleDelete(a)} aria-label={`Delete assessment for ${a.patientName}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {data.totalPages > 1 && (
            <nav className="mt-5 flex items-center justify-between" aria-label="Pagination">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /> Previous</button>
              <span className="text-sm text-navy-500">Page {data.page} of {data.totalPages} · {data.total} total</span>
              <button className="btn-secondary" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next <ChevronRight className="h-4 w-4" /></button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
