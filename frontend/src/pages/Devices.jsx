import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../api/client';
import { DeviceIcon } from '../components/Icon';
import { LoadingState, ErrorBanner, EmptyState } from '../components/States';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [status, setStatus] = useState('loading');

  async function load() {
    setStatus('loading');
    try {
      const { data } = await api.get('/devices');
      setDevices(data);
      setStatus(data.length ? 'ready' : 'empty');
    } catch (err) {
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="section py-14">
      <span className="eyebrow mb-3">All devices</span>
      <h1 className="text-4xl font-bold text-ink-900 mb-3">Devices we repair</h1>
      <p className="text-ink-500 max-w-xl mb-10">
        Pick a device category to see brands, models and available repairs with upfront pricing.
      </p>

      {status === 'loading' && <LoadingState label="Loading devices..." />}
      {status === 'error' && <ErrorBanner message="Couldn't load devices right now." onRetry={load} />}
      {status === 'empty' && <EmptyState title="No devices listed yet" />}

      {status === 'ready' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {devices.map((d) => (
            <Link
              key={d._id}
              to={`/book?device=${d._id}`}
              className="card p-6 flex flex-col items-center text-center gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center group-hover:bg-primary-700 group-hover:text-white transition-colors">
                <DeviceIcon name={d.icon} className="w-7 h-7" />
              </div>
              <span className="font-semibold text-ink-900">{d.name}</span>
              {d.description && <p className="text-xs text-ink-500 leading-relaxed">{d.description}</p>}
              <span className="text-xs font-semibold text-primary-700 flex items-center gap-1 mt-1">
                See repairs <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
