import { useEffect, useState } from 'react';
import { Check, X, Trash2, Star } from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { LoadingState, ErrorBanner, EmptyState } from '../../components/States';
import { StatusBadge } from '../../components/Badges';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  async function load() {
    setStatus('loading');
    try {
      const { data } = await api.get('/reviews', { params: { all: 'true' } });
      setReviews(data);
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setReviewStatus(review, newStatus) {
    try {
      const { data } = await api.put(`/reviews/${review._id}`, { status: newStatus });
      setReviews((list) => list.map((r) => (r._id === data._id ? data : r)));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function handleDelete(review) {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/reviews/${review._id}`);
      setReviews((list) => list.filter((r) => r._id !== review._id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Reviews</h1>
      <p className="text-sm text-ink-500 mb-6">{reviews.length} total reviews</p>

      <div className="flex gap-2 mb-6">
        {['all', 'Pending', 'Approved', 'Rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary-700 text-white' : 'bg-white text-ink-700 border border-ink-900/10 hover:bg-ink-900/5'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorBanner message={error} onRetry={load} />}
      {status === 'ready' && filtered.length === 0 && <EmptyState title="No reviews found" />}

      {status === 'ready' && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-300'}`} />
                  ))}
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-ink-700 mb-3">"{r.comment}"</p>
              <p className="text-xs text-ink-500 mb-4">{r.customerName} · {r.deviceRepaired}</p>
              <div className="flex items-center gap-2">
                {r.status !== 'Approved' && (
                  <button onClick={() => setReviewStatus(r, 'Approved')} className="btn-secondary text-xs px-3 py-1.5">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {r.status !== 'Rejected' && (
                  <button onClick={() => setReviewStatus(r, 'Rejected')} className="btn-ghost text-xs px-3 py-1.5">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                <button onClick={() => handleDelete(r)} className="btn-ghost text-xs px-3 py-1.5 text-red-600 ml-auto">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
