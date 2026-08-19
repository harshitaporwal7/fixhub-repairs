import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Clock, ShieldCheck, MapPin } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DeviceIcon, RepairIcon } from '../components/Icon';
import { LoadingState, ErrorBanner, EmptyState } from '../components/States';

const STEPS = ['Device', 'Brand', 'Model', 'Repair', 'Location', 'Schedule', 'Your Details'];
const TIME_SLOTS = ['9:30 AM', '11:00 AM', '12:30 PM', '1:30 PM', '3:00 PM', '4:30 PM', '5:30 PM'];

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

export default function BookRepair() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [devices, setDevices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selection, setSelection] = useState({
    device: null,
    brand: null,
    model: null,
    repair: null,
    location: null,
    date: todayISO(),
    time: TIME_SLOTS[0],
  });

  const [customer, setCustomer] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load devices on mount
  useEffect(() => {
    setLoading(true);
    api
      .get('/devices')
      .then(({ data }) => {
        setDevices(data);
        const preselect = params.get('device');
        if (preselect) {
          const found = data.find((d) => d._id === preselect);
          if (found) setSelection((s) => ({ ...s, device: found }));
        }
      })
      .catch(() => setError('Could not load devices.'))
      .finally(() => setLoading(false));
    api.get('/locations').then(({ data }) => setLocations(data)).catch(() => {});
  }, []);

  // If a repair was preselected via URL, fetch it directly and skip ahead
  useEffect(() => {
    const repairId = params.get('repair');
    if (!repairId) return;
    api
      .get(`/repairs/${repairId}`)
      .then(({ data }) => {
        setSelection((s) => ({
          ...s,
          device: data.device,
          brand: data.brand,
          model: data.model,
          repair: data,
        }));
        setStep(4);
      })
      .catch(() => {});
  }, [params]);

  // Load brands whenever device changes
  useEffect(() => {
    if (!selection.device) return;
    setLoading(true);
    api
      .get('/brands', { params: { device: selection.device._id } })
      .then(({ data }) => setBrands(data))
      .catch(() => setError('Could not load brands.'))
      .finally(() => setLoading(false));
  }, [selection.device]);

  // Load models whenever brand changes
  useEffect(() => {
    if (!selection.brand) return;
    setLoading(true);
    api
      .get('/models', { params: { brand: selection.brand._id } })
      .then(({ data }) => setModels(data))
      .catch(() => setError('Could not load models.'))
      .finally(() => setLoading(false));
  }, [selection.brand]);

  // Load repairs whenever model changes
  useEffect(() => {
    if (!selection.model) return;
    setLoading(true);
    api
      .get('/repairs', { params: { model: selection.model._id } })
      .then(({ data }) => setRepairs(data))
      .catch(() => setError('Could not load repair options.'))
      .finally(() => setLoading(false));
  }, [selection.model]);

  function selectDevice(d) {
    setSelection({ device: d, brand: null, model: null, repair: null, location: selection.location, date: selection.date, time: selection.time });
    setStep(1);
  }
  function selectBrand(b) {
    setSelection((s) => ({ ...s, brand: b, model: null, repair: null }));
    setStep(2);
  }
  function selectModel(m) {
    setSelection((s) => ({ ...s, model: m, repair: null }));
    setStep(3);
  }
  function selectRepair(r) {
    setSelection((s) => ({ ...s, repair: r }));
    setStep(4);
  }
  function selectLocation(l) {
    setSelection((s) => ({ ...s, location: l }));
    setStep(5);
  }

  function goBack() {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data } = await api.post('/bookings', {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        notes: customer.notes,
        device: selection.device._id,
        brand: selection.brand._id,
        model: selection.model._id,
        repairService: selection.repair._id,
        location: selection.location._id,
        preferredDate: selection.date,
        preferredTime: selection.time,
      });
      navigate(`/booking-confirmation/${data._id}`, { state: { booking: data } });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const canGoToSchedule = selection.location;
  const isFinalStep = step === 6;

  return (
    <div className="section py-14 max-w-4xl">
      <span className="eyebrow mb-3">Book a repair</span>
      <h1 className="text-4xl font-bold text-ink-900 mb-8">Let's get your device fixed</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mb-10 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                i < step ? 'bg-accent-500 text-white' : i === step ? 'bg-primary-700 text-white' : 'bg-ink-900/10 text-ink-500'
              }`}
            >
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-ink-900' : 'text-ink-500'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="w-4 sm:w-8 h-px bg-ink-900/10" />}
          </div>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* STEP 0: Device */}
      {step === 0 && (
        <StepShell title="Select your device">
          {loading && !devices.length ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {devices.map((d) => (
                <SelectCard key={d._id} active={selection.device?._id === d._id} onClick={() => selectDevice(d)}>
                  <DeviceIcon name={d.icon} className="w-7 h-7 mb-2" />
                  <span className="font-medium text-sm">{d.name}</span>
                </SelectCard>
              ))}
            </div>
          )}
        </StepShell>
      )}

      {/* STEP 1: Brand */}
      {step === 1 && (
        <StepShell title={`Select a brand for your ${selection.device?.name}`} onBack={goBack}>
          {loading ? (
            <LoadingState />
          ) : brands.length === 0 ? (
            <EmptyState title="No brands available for this device yet" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {brands.map((b) => (
                <SelectCard key={b._id} active={selection.brand?._id === b._id} onClick={() => selectBrand(b)}>
                  <span className="font-medium text-sm">{b.name}</span>
                </SelectCard>
              ))}
            </div>
          )}
        </StepShell>
      )}

      {/* STEP 2: Model */}
      {step === 2 && (
        <StepShell title={`Select your ${selection.brand?.name} model`} onBack={goBack}>
          {loading ? (
            <LoadingState />
          ) : models.length === 0 ? (
            <EmptyState title="No models available for this brand yet" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {models.map((m) => (
                <SelectCard key={m._id} active={selection.model?._id === m._id} onClick={() => selectModel(m)}>
                  <span className="font-medium text-sm">{m.name}</span>
                  {m.releaseYear && <span className="text-xs text-ink-500">{m.releaseYear}</span>}
                </SelectCard>
              ))}
            </div>
          )}
        </StepShell>
      )}

      {/* STEP 3: Repair / Problem */}
      {step === 3 && (
        <StepShell title={`What's wrong with your ${selection.model?.name}?`} onBack={goBack}>
          {loading ? (
            <LoadingState />
          ) : repairs.length === 0 ? (
            <EmptyState title="No repairs listed for this model yet" message="Try a different model or contact us directly." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {repairs.map((r) => (
                <button
                  key={r._id}
                  onClick={() => selectRepair(r)}
                  className={`card p-5 text-left flex items-start gap-4 transition-all hover:shadow-card-hover ${
                    selection.repair?._id === r._id ? 'ring-2 ring-primary-600' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-500/10 text-accent-600 flex items-center justify-center flex-shrink-0">
                    <RepairIcon category={r.category} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink-900">{r.category}</p>
                    <div className="flex items-center gap-3 text-xs text-ink-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {r.estimatedMinutes} min</span>
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> {r.warrantyMonths} mo</span>
                    </div>
                  </div>
                  <span className="font-bold text-primary-700">₹{r.price.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          )}
        </StepShell>
      )}

      {/* STEP 4: Location */}
      {step === 4 && (
        <StepShell title="Choose a store" onBack={goBack}>
          {locations.length === 0 ? (
            <LoadingState />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {locations.map((l) => (
                <button
                  key={l._id}
                  onClick={() => selectLocation(l)}
                  className={`card p-5 text-left flex items-start gap-3 transition-all hover:shadow-card-hover ${
                    selection.location?._id === l._id ? 'ring-2 ring-primary-600' : ''
                  }`}
                >
                  <MapPin className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink-900">{l.name}</p>
                    <p className="text-sm text-ink-500">{l.address}, {l.city}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </StepShell>
      )}

      {/* STEP 5: Schedule */}
      {step === 5 && canGoToSchedule && (
        <StepShell title="Pick a date and time" onBack={goBack}>
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label">Preferred date</label>
              <input
                type="date"
                min={todayISO()}
                className="input"
                value={selection.date}
                onChange={(e) => setSelection((s) => ({ ...s, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Preferred time</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setSelection((s) => ({ ...s, time: t }))}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      selection.time === t
                        ? 'bg-primary-700 text-white border-primary-700'
                        : 'bg-white text-ink-700 border-ink-900/10 hover:bg-ink-900/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setStep(6)}>
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </StepShell>
      )}

      {/* STEP 6: Customer details + confirm */}
      {isFinalStep && (
        <StepShell title="Your details" onBack={goBack}>
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              {submitError && <ErrorBanner message={submitError} />}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full name</label>
                  <input required className="input" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input required type="email" className="input" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Phone</label>
                <input required className="input" value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} />
              </div>
              <div>
                <label className="label">Address (optional)</label>
                <input className="input" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} />
              </div>
              <div>
                <label className="label">Additional notes (optional)</label>
                <textarea rows={3} className="input resize-none" value={customer.notes} onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))} />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="card p-5 sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3">Booking summary</p>
                <SummaryRow label="Device" value={`${selection.brand?.name} ${selection.model?.name}`} />
                <SummaryRow label="Repair" value={selection.repair?.category} />
                <SummaryRow label="Store" value={selection.location?.name} />
                <SummaryRow label="Date" value={new Date(selection.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} />
                <SummaryRow label="Time" value={selection.time} />
                <div className="border-t border-ink-900/10 mt-3 pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-700">Estimated price</span>
                  <span className="text-xl font-bold text-primary-700">₹{selection.repair?.price?.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-ink-500 mt-2">Includes a {selection.repair?.warrantyMonths}-month warranty · ~{selection.repair?.estimatedMinutes} min</p>
              </div>
            </div>
          </form>
        </StepShell>
      )}
    </div>
  );
}

function StepShell({ title, onBack, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="w-9 h-9 rounded-lg border border-ink-900/10 flex items-center justify-center hover:bg-ink-900/5" aria-label="Go back">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SelectCard({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`card p-5 flex flex-col items-center text-center gap-1 transition-all hover:shadow-card-hover ${
        active ? 'ring-2 ring-primary-600' : ''
      }`}
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900 text-right">{value}</span>
    </div>
  );
}
