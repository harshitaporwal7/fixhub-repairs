import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, CheckCircle2, Users, IndianRupee } from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { LoadingState, ErrorBanner } from '../../components/States';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(({ data }) => {
        setStats(data);
        setStatus('ready');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, []);

  if (status === 'loading') return <LoadingState label="Loading dashboard..." />;
  if (status === 'error') return <ErrorBanner message={error} />;

  const cards = [
    { label: 'Total bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'bg-primary-50 text-primary-700' },
    { label: 'Pending bookings', value: stats.pendingBookings, icon: Clock, color: 'bg-amber-50 text-amber-700' },
    { label: 'Completed repairs', value: stats.completedBookings, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'bg-accent-500/10 text-accent-600' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-primary-50 text-primary-700' },
  ];

  const maxBookingCount = Math.max(1, ...stats.bookingsOverTime.map((d) => d.count));
  const maxRevenue = Math.max(1, ...stats.revenueOverTime.map((d) => d.total));
  const maxCategoryCount = Math.max(1, ...stats.repairCategories.map((d) => d.count));
  const maxDeviceCount = Math.max(1, ...stats.devicePopularity.map((d) => d.count));

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Dashboard</h1>
      <p className="text-sm text-ink-500 mb-6">A quick look at how FixHub is doing.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-bold text-ink-900">{c.value}</p>
            <p className="text-xs text-ink-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Bookings over time</h3>
          {stats.bookingsOverTime.length === 0 ? (
            <p className="text-sm text-ink-500">No booking data yet.</p>
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {stats.bookingsOverTime.map((d) => (
                <div key={d._id} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                  <div
                    className="w-full bg-primary-600 rounded-t hover:bg-primary-700 transition-colors"
                    style={{ height: `${(d.count / maxBookingCount) * 100}%`, minHeight: 4 }}
                    title={`${d._id}: ${d.count}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Revenue over time</h3>
          {stats.revenueOverTime.length === 0 ? (
            <p className="text-sm text-ink-500">No revenue data yet.</p>
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {stats.revenueOverTime.map((d) => (
                <div key={d._id} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <div
                    className="w-full bg-accent-500 rounded-t hover:bg-accent-600 transition-colors"
                    style={{ height: `${(d.total / maxRevenue) * 100}%`, minHeight: 4 }}
                    title={`${d._id}: ₹${d.total}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Popular repair categories</h3>
          {stats.repairCategories.length === 0 ? (
            <p className="text-sm text-ink-500">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.repairCategories.map((c) => (
                <div key={c._id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink-700">{c._id}</span>
                    <span className="text-ink-500">{c.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-900/5 overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: `${(c.count / maxCategoryCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Popular devices</h3>
          {stats.devicePopularity.length === 0 ? (
            <p className="text-sm text-ink-500">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.devicePopularity.map((c) => (
                <div key={c._id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink-700">{c._id}</span>
                    <span className="text-ink-500">{c.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-900/5 overflow-hidden">
                    <div className="h-full bg-accent-500 rounded-full" style={{ width: `${(c.count / maxDeviceCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
