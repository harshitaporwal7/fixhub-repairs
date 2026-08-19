import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck } from 'lucide-react';
import api from '../api/client';
import { RepairIcon } from '../components/Icon';
import { LoadingState, ErrorBanner, EmptyState } from '../components/States';

export default function Services() {
  const [repairs, setRepairs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [status, setStatus] = useState('loading');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  async function load() {
    setStatus('loading');
    try {
      const [repairsRes, devicesRes] = await Promise.all([api.get('/repairs'), api.get('/devices')]);
      setRepairs(repairsRes.data);
      setDevices(devicesRes.data);
      setStatus(repairsRes.data.length ? 'ready' : 'empty');
    } catch (err) {
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(
    () => [...new Set(repairs.map((r) => r.category))].sort(),
    [repairs]
  );

  const filtered = useMemo(() => {
    return repairs.filter((r) => {
      const deviceOk = deviceFilter === 'all' || r.device?._id === deviceFilter;
      const categoryOk = categoryFilter === 'all' || r.category === categoryFilter;
      return deviceOk && categoryOk;
    });
  }, [repairs, deviceFilter, categoryFilter]);

  return (
    <div className="section py-14">
      <span className="eyebrow mb-3">Pricing</span>
      <h1 className="text-4xl font-bold text-ink-900 mb-3">Repair services</h1>
      <p className="text-ink-500 max-w-xl mb-8">
        Transparent pricing for every repair, by device and model. Filter below or start a booking directly.
      </p>

      {status === 'ready' && (
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All devices</option>
            {devices.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All repair types</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {status === 'loading' && <LoadingState label="Loading repair services..." />}
      {status === 'error' && <ErrorBanner message="Couldn't load services right now." onRetry={load} />}
      {status === 'empty' && <EmptyState title="No repair services listed yet" />}

      {status === 'ready' && filtered.length === 0 && (
        <EmptyState title="No repairs match those filters" message="Try a different device or repair type." />
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div key={r._id} className="card p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent-500/10 text-accent-600 flex items-center justify-center">
                  <RepairIcon category={r.category} className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-primary-700">₹{r.price.toLocaleString('en-IN')}</span>
              </div>
              <p className="font-semibold text-ink-900 mb-0.5">{r.category}</p>
              <p className="text-sm text-ink-500 mb-4">{r.model?.name} &middot; {r.brand?.name}</p>
              <div className="flex items-center gap-4 text-xs text-ink-500 mb-5">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {r.estimatedMinutes} min</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> {r.warrantyMonths} mo warranty</span>
              </div>
              <Link to={`/book?repair=${r._id}`} className="btn-primary mt-auto justify-center">
                Book This Repair
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
