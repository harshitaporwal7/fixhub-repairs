import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { LoadingState, ErrorBanner, EmptyState } from '../../components/States';
import { StatusBadge } from '../../components/Badges';

const STATUSES = ['New', 'In Progress', 'Resolved'];

export default function AdminContact() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    try {
      const { data } = await api.get('/contact');
      setRequests(data);
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(req, newStatus) {
    try {
      const { data } = await api.put(`/contact/${req._id}`, { status: newStatus });
      setRequests((list) => list.map((r) => (r._id === data._id ? data : r)));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Contact Requests</h1>
      <p className="text-sm text-ink-500 mb-6">{requests.length} messages received</p>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorBanner message={error} onRetry={load} />}
      {status === 'ready' && requests.length === 0 && <EmptyState title="No messages yet" />}

      {status === 'ready' && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-semibold text-ink-900">{r.subject}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {r.name} · <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{r.email}</span>
                    {r.phone && <span className="inline-flex items-center gap-1 ml-2"><Phone className="w-3 h-3" />{r.phone}</span>}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-ink-700 mb-4">{r.message}</p>
              <div className="flex items-center gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(r, s)}
                    disabled={r.status === s}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ${
                      r.status === s ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-ink-700 border-ink-900/10 hover:bg-ink-900/5'
                    }`}
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
