import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { LoadingState, ErrorBanner, EmptyState } from '../components/States';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState('loading');

  async function load() {
    setStatus('loading');
    try {
      const { data } = await api.get('/locations');
      setLocations(data);
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
      <span className="eyebrow mb-3">Find us</span>
      <h1 className="text-4xl font-bold text-ink-900 mb-3">Our locations</h1>
      <p className="text-ink-500 max-w-xl mb-10">
        Walk in or book ahead — every FixHub store offers the same certified repairs and warranty.
      </p>

      {status === 'loading' && <LoadingState label="Loading locations..." />}
      {status === 'error' && <ErrorBanner message="Couldn't load locations right now." onRetry={load} />}
      {status === 'empty' && <EmptyState title="No locations listed yet" />}

      {status === 'ready' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div key={loc._id} className="card p-6 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink-900 mb-1">{loc.name}</h3>
              <p className="text-sm text-ink-500 mb-4">
                {loc.address}, {loc.city}{loc.state ? `, ${loc.state}` : ''} {loc.postalCode}
              </p>

              <div className="space-y-2 text-sm text-ink-700 mb-4">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-ink-500" /> {loc.phone}</p>
                {loc.openingHours?.map((h) => (
                  <p key={h.day} className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-ink-500 flex-shrink-0" /> {h.day}: {h.hours}
                  </p>
                ))}
              </div>

              {loc.services?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {loc.services.map((s) => (
                    <span key={s} className="text-xs bg-ink-900/5 text-ink-700 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              )}

              {/* Integration-ready map placeholder */}
              <div className="rounded-xl bg-primary-50 border border-primary-100 h-28 flex items-center justify-center text-xs text-primary-700 mb-5">
                Map view available at checkout
              </div>

              <Link to={`/book?location=${loc._id}`} className="btn-primary mt-auto justify-center">
                Book Repair <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
