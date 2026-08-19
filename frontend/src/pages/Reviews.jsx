import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorBanner, EmptyState } from '../components/States';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const { user, isAdmin } = useAuth();

  async function load() {
    setStatus('loading');
    try {
      const { data } = await api.get('/reviews');
      setReviews(data);
      setStatus(data.length ? 'ready' : 'empty');
    } catch (err) {
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="section py-14">
      <span className="eyebrow mb-3">Customer stories</span>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-ink-900 mb-3">Reviews</h1>
          {status === 'ready' && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(average) ? 'fill-amber-400 text-amber-400' : 'text-ink-300'}`} />
                ))}
              </div>
              <span className="text-ink-700 font-semibold">{average} average</span>
              <span className="text-ink-500 text-sm">from {reviews.length} reviews</span>
            </div>
          )}
        </div>
        {user && !isAdmin && (
          <Link to="/dashboard" className="btn-secondary">
            Leave a review from your bookings
          </Link>
        )}
      </div>

      {status === 'loading' && <LoadingState label="Loading reviews..." />}
      {status === 'error' && <ErrorBanner message="Couldn't load reviews right now." onRetry={load} />}
      {status === 'empty' && (
        <EmptyState title="No reviews yet" message="Be the first to leave a review after your repair is complete." />
      )}

      {status === 'ready' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r._id} className="card p-6">
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-300'}`} />
                ))}
              </div>
              <p className="text-sm text-ink-700 leading-relaxed mb-4">"{r.comment}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{r.customerName}</p>
                  <p className="text-xs text-ink-500">{r.deviceRepaired}</p>
                </div>
                <p className="text-xs text-ink-300">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
