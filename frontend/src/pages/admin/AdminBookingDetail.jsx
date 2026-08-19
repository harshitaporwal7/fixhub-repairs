import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Phone, Mail } from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { LoadingState, ErrorBanner, SuccessBanner } from '../../components/States';
import { StatusBadge } from '../../components/Badges';

const STATUSES = ['Pending', 'Confirmed', 'In Repair', 'Ready for Pickup', 'Completed', 'Cancelled'];

export default function AdminBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ status: '', price: '', internalNotes: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function load() {
    setLoading(true);
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => {
        setBooking(data);
        setForm({ status: data.status, price: data.price, internalNotes: data.internalNotes || '' });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { data } = await api.put(`/bookings/${id}`, {
        status: form.status,
        price: Number(form.price),
        internalNotes: form.internalNotes,
      });
      setBooking(data);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading booking..." />;
  if (!booking) return <ErrorBanner message={error || 'Booking not found.'} />;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to bookings
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{booking.bookingId}</h1>
          <p className="text-sm text-ink-500">{booking.brand?.name} {booking.model?.name} — {booking.repairService?.category}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-ink-900 mb-1">Customer</h3>
          <Row icon={<Mail className="w-4 h-4" />} label="Email" value={booking.customerEmail} />
          <Row icon={<Phone className="w-4 h-4" />} label="Phone" value={booking.customerPhone} />
          {booking.customerAddress && <Row label="Address" value={booking.customerAddress} />}

          <div className="border-t border-ink-900/10 pt-4">
            <Row icon={<MapPin className="w-4 h-4" />} label="Store" value={`${booking.location?.name} — ${booking.location?.city}`} />
            <Row icon={<Calendar className="w-4 h-4" />} label="Date" value={new Date(booking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <Row icon={<Clock className="w-4 h-4" />} label="Time" value={booking.preferredTime} />
          </div>

          {booking.notes && (
            <div className="border-t border-ink-900/10 pt-4">
              <p className="text-xs text-ink-500 mb-1">Customer notes</p>
              <p className="text-sm text-ink-700">{booking.notes}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="lg:col-span-3 card p-6 space-y-4">
          <h3 className="font-semibold text-ink-900 mb-1">Manage booking</h3>
          {saved && <SuccessBanner message="Booking updated." />}
          {error && <ErrorBanner message={error} />}

          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Price (₹)</label>
            <input
              type="number"
              className="input"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Internal notes</label>
            <textarea
              rows={4}
              className="input resize-none"
              placeholder="Notes visible to staff only..."
              value={form.internalNotes}
              onChange={(e) => setForm((f) => ({ ...f, internalNotes: e.target.value }))}
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-1">
      {icon && <span className="text-primary-600 mt-0.5">{icon}</span>}
      <div>
        <p className="text-ink-500 text-xs">{label}</p>
        <p className="font-medium text-ink-900 text-sm">{value}</p>
      </div>
    </div>
  );
}
