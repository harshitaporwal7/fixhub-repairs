import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, MapPin, ChevronRight, LogOut } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorBanner, EmptyState, SuccessBanner } from '../components/States';
import { StatusBadge } from '../components/Badges';

export default function Dashboard() {
  const { user, updateProfile, logout } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Hi, {user?.name?.split(' ')[0]}</h1>
          <p className="text-ink-500">Manage your bookings and profile.</p>
        </div>
        <button onClick={logout} className="btn-ghost text-sm">
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-ink-900/10">
        <TabButton active={tab === 'bookings'} onClick={() => setTab('bookings')}>
          My Bookings
        </TabButton>
        <TabButton active={tab === 'profile'} onClick={() => setTab('profile')}>
          Profile
        </TabButton>
      </div>

      {tab === 'bookings' && (
        <div>
          {loading && <LoadingState />}
          {!loading && error && <ErrorBanner message={error} />}
          {!loading && !error && bookings.length === 0 && (
            <EmptyState
              title="No bookings yet"
              message="Once you book a repair, it'll show up here so you can track its status."
              action={<Link to="/book" className="btn-primary">Book a repair</Link>}
            />
          )}
          {!loading && bookings.length > 0 && (
            <div className="grid gap-3">
              {bookings.map((b) => (
                <Link
                  key={b._id}
                  to={`/dashboard/bookings/${b._id}`}
                  className="card p-5 flex items-center justify-between gap-4 hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-ink-900">{b.bookingId}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-sm text-ink-700">{b.brand?.name} {b.model?.name} — {b.repairService?.category}</p>
                    <div className="flex items-center gap-4 text-xs text-ink-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(b.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {b.location?.name}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-primary-700">₹{b.price?.toLocaleString('en-IN')}</span>
                    <ChevronRight className="w-4 h-4 text-ink-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'profile' && <ProfileForm />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-primary-700 text-primary-700' : 'border-transparent text-ink-500 hover:text-ink-700'
      }`}
    >
      {children}
    </button>
  );
}

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const res = await updateProfile(form);
    if (res.success) setMessage('Profile updated.');
    else setError(res.message);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-lg space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
          <User className="w-5 h-5 text-primary-700" />
        </div>
        <div>
          <p className="font-semibold text-ink-900">{user?.email}</p>
          <p className="text-xs text-ink-500">Your email cannot be changed.</p>
        </div>
      </div>
      {message && <SuccessBanner message={message} />}
      {error && <ErrorBanner message={error} />}
      <div>
        <label className="label">Full name</label>
        <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label className="label">Phone</label>
        <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      </div>
      <div>
        <label className="label">Address</label>
        <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
