import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { LoadingState, ErrorBanner, EmptyState } from '../components/States';
import { StatusBadge } from '../components/Badges';

export default function TrackBooking() {
  const [params] = useSearchParams();
  const [bookingId, setBookingId] = useState(params.get('id') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const { data } = await api.get(`/bookings/track/${encodeURIComponent(bookingId.trim())}`, {
        params: { email: email.trim() },
      });
      setBooking(data);
    } catch (err) {
      setBooking(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section py-14 max-w-xl">
      <span className="eyebrow mb-3">Track your repair</span>
      <h1 className="text-3xl font-bold text-ink-900 mb-2">Where's my device?</h1>
      <p className="text-ink-500 mb-8">Enter your booking reference and the email you booked with.</p>

      <form onSubmit={handleSearch} className="card p-5 mb-8 space-y-4">
        <div>
          <label className="label">Booking reference</label>
          <input
            required
            className="input uppercase"
            placeholder="FX-AB12CD34"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email used at booking</label>
          <input
            required
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Track booking'}
        </button>
      </form>

      {loading && <LoadingState />}
      {!loading && error && <ErrorBanner message={error} />}

      {!loading && !error && searched && !booking && (
        <EmptyState title="No booking found" message="Double check your reference ID and email." />
      )}

      {booking && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-bold text-primary-700">{booking.bookingId}</p>
            <StatusBadge status={booking.status} />
          </div>
          <div className="space-y-3 text-sm">
            <Row icon={<ShieldCheck className="w-4 h-4" />} label="Repair" value={booking.repairService?.category} />
            <Row icon={<MapPin className="w-4 h-4" />} label="Store" value={`${booking.location?.name} — ${booking.location?.address}`} />
            <Row
              icon={<Calendar className="w-4 h-4" />}
              label="Date"
              value={new Date(booking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            />
            <Row icon={<Clock className="w-4 h-4" />} label="Time" value={booking.preferredTime} />
          </div>
          <div className="border-t border-ink-900/10 mt-4 pt-4 flex items-center justify-between">
            <span className="text-sm text-ink-700">Price</span>
            <span className="text-lg font-bold text-primary-700">₹{booking.price?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="text-primary-600 mt-0.5">{icon}</span>
      <div>
        <p className="text-ink-500 text-xs">{label}</p>
        <p className="font-medium text-ink-900">{value}</p>
      </div>
    </div>
  );
}
