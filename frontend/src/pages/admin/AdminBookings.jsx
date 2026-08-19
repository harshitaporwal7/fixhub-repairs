import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { LoadingState, ErrorBanner, EmptyState } from '../../components/States';
import { StatusBadge } from '../../components/Badges';

const STATUSES = ['Pending', 'Confirmed', 'In Repair', 'Ready for Pickup', 'Completed', 'Cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function load() {
    setStatus('loading');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/bookings', { params });
      setBookings(data);
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Bookings</h1>
      <p className="text-sm text-ink-500 mb-6">{bookings.length} bookings found</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or booking ID..."
            className="input pl-10 w-72"
          />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorBanner message={error} onRetry={load} />}
      {status === 'ready' && bookings.length === 0 && <EmptyState title="No bookings match" />}

      {status === 'ready' && bookings.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-ink-500">
                <th className="px-5 py-3 font-medium">Booking ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Device / Repair</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.02]">
                  <td className="px-5 py-3 font-medium text-ink-900">{b.bookingId}</td>
                  <td className="px-5 py-3">
                    <p className="text-ink-900">{b.customerName}</p>
                    <p className="text-xs text-ink-500">{b.customerEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{b.brand?.name} {b.model?.name} — {b.repairService?.category}</td>
                  <td className="px-5 py-3 text-ink-700">{new Date(b.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-5 py-3 font-semibold text-ink-900">₹{b.price?.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-3">
                    <Link to={`/admin/bookings/${b._id}`} className="p-2 rounded-lg hover:bg-ink-900/5 text-ink-500 inline-flex">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
