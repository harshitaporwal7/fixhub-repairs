import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, ShieldCheck, Phone } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { LoadingState, ErrorBanner, SuccessBanner } from '../components/States';
import { StatusBadge, StarRating } from '../components/Badges';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  function load() {
    setLoading(true);
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
    setCancelling(true);
    try {
      const { data } = await api.delete(`/bookings/${id}`);
      setBooking(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <LoadingState label="Loading booking..." />;
  if (error || !booking) {
    return (
      <div className="section py-14 max-w-lg">
        <ErrorBanner message={error || 'Booking not found.'} />
      </div>
    );
  }

  const canCancel = ['Pending', 'Confirmed'].includes(booking.status);

  return (
    <div className="section py-12 max-w-2xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to my bookings
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{booking.bookingId}</h1>
          <p className="text-ink-500 text-sm">{booking.brand?.name} {booking.model?.name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="card p-6 mb-6 space-y-4">
        <Row icon={<ShieldCheck className="w-4 h-4" />} label="Repair" value={booking.repairService?.category} />
        <Row icon={<MapPin className="w-4 h-4" />} label="Store" value={`${booking.location?.name} — ${booking.location?.address}, ${booking.location?.city}`} />
        <Row icon={<Phone className="w-4 h-4" />} label="Store phone" value={booking.location?.phone} />
        <Row
          icon={<Calendar className="w-4 h-4" />}
          label="Date"
          value={new Date(booking.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        />
        <Row icon={<Clock className="w-4 h-4" />} label="Time" value={booking.preferredTime} />
        {booking.notes && <Row icon={<ShieldCheck className="w-4 h-4" />} label="Your notes" value={booking.notes} />}

        <div className="border-t border-ink-900/10 pt-4 flex items-center justify-between">
          <span className="text-sm text-ink-700">Price</span>
          <span className="text-xl font-bold text-primary-700">₹{booking.price?.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-xs text-ink-500">Warranty: {booking.warrantyMonths} months · Estimated time: {booking.estimatedMinutes} minutes</p>
      </div>

      {canCancel && (
        <button onClick={handleCancel} disabled={cancelling} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 mb-8">
          {cancelling ? 'Cancelling...' : 'Cancel booking'}
        </button>
      )}

      {booking.status === 'Completed' && <ReviewSection booking={booking} />}
    </div>
  );
}

function ReviewSection({ booking }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/reviews', { booking: booking._id, rating, comment });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <SuccessBanner message="Thanks for your review! It will appear on our site once approved." />;
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-ink-900 mb-1">How was your repair?</h2>
      <p className="text-sm text-ink-500 mb-4">Your feedback helps other customers, and helps us improve.</p>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4 mt-3">
        <StarRating rating={rating} size="w-7 h-7" onChange={setRating} />
        <textarea
          required
          rows={3}
          className="input resize-none"
          placeholder="Tell us about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Submitting...' : 'Submit review'}
        </button>
      </form>
    </div>
  );
}

function Row({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-primary-600 mt-0.5">{icon}</span>
      <div>
        <p className="text-ink-500 text-xs">{label}</p>
        <p className="font-medium text-ink-900">{value}</p>
      </div>
    </div>
  );
}
