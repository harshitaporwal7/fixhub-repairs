import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, MapPin, Clock, ShieldCheck, Copy, Check } from 'lucide-react';
import api from '../api/client';
import { LoadingState, ErrorBanner } from '../components/States';

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (booking) return;
    // If the page was opened directly (e.g. refreshed) without state, we can't
    // re-fetch without auth for a guest booking, so just show a friendly message.
    setLoading(false);
    setError('We could not find that booking. If you just booked, check your email for the confirmation.');
  }, [booking]);

  function copyId() {
    navigator.clipboard.writeText(booking.bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <LoadingState label="Loading your confirmation..." />;
  if (error || !booking) {
    return (
      <div className="section py-16 max-w-lg text-center">
        <ErrorBanner message={error || 'Booking not found.'} />
        <Link to="/track" className="btn-secondary mt-6 inline-flex">
          Track a booking instead
        </Link>
      </div>
    );
  }

  return (
    <div className="section py-14 max-w-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-9 h-9 text-accent-600" />
        </div>
        <h1 className="text-3xl font-bold text-ink-900 mb-2">Booking confirmed</h1>
        <p className="text-ink-500">
          We've sent the details to <span className="font-medium text-ink-700">{booking.customerEmail}</span>.
        </p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-ink-900/10">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500 mb-1">Booking reference</p>
            <p className="text-xl font-bold text-primary-700">{booking.bookingId}</p>
          </div>
          <button onClick={copyId} className="btn-ghost text-sm">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Row icon={<ShieldCheck className="w-4 h-4" />} label="Repair" value={booking.repairService?.category || booking.repairService?.name} />
          <Row icon={<MapPin className="w-4 h-4" />} label="Store" value={booking.location?.name} />
          <Row
            icon={<Calendar className="w-4 h-4" />}
            label="Date"
            value={new Date(booking.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          />
          <Row icon={<Clock className="w-4 h-4" />} label="Time" value={booking.preferredTime} />
        </div>

        <div className="border-t border-ink-900/10 mt-4 pt-4 flex items-center justify-between">
          <span className="text-sm text-ink-700">Estimated price</span>
          <span className="text-xl font-bold text-primary-700">₹{booking.price?.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-xs text-ink-500 mt-1">Status: <span className="font-medium text-ink-700">{booking.status}</span></p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to={`/track?id=${booking.bookingId}&email=${encodeURIComponent(booking.customerEmail)}`} className="btn-secondary flex-1">
          Track this booking
        </Link>
        <Link to="/" className="btn-primary flex-1">
          Back to home
        </Link>
      </div>
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
