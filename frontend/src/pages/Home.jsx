import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Clock, Award, Sparkles, Smile, ArrowRight, MapPin, Star, ChevronRight,
} from 'lucide-react';
import api from '../api/client';
import { DeviceIcon, RepairIcon } from '../components/Icon';
import { LoadingState } from '../components/States';

const REPAIR_CATEGORIES = [
  'Screen Replacement', 'Battery Replacement', 'Charging Port', 'Camera Repair',
  'Speaker/Microphone', 'Water Damage', 'Software Issues', 'Back Glass',
];

const TRUST_POINTS = [
  { icon: Clock, title: 'Fast turnaround', desc: 'Most repairs done same-day, many in under an hour.' },
  { icon: ShieldCheck, title: 'Warranty included', desc: 'Every repair backed by a written parts & labor warranty.' },
  { icon: Award, title: 'Certified technicians', desc: 'Trained, background-checked, and repair-obsessed.' },
  { icon: Sparkles, title: 'Quality parts', desc: 'Tested components, never refurbished screens.' },
  { icon: Smile, title: '4.8/5 customer rating', desc: 'Thousands of devices fixed and counting.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Select your device', desc: 'Phone, tablet, laptop, watch or console.' },
  { step: '02', title: 'Select the problem', desc: 'Tell us what needs fixing.' },
  { step: '03', title: 'Choose your repair', desc: 'See upfront pricing and time.' },
  { step: '04', title: 'Book an appointment', desc: 'Pick a store, date and time.' },
  { step: '05', title: 'Get your device back', desc: 'Fixed, tested, and warrantied.' },
];

const PREVIEW_EXAMPLES = [
  { device: 'iPhone 15', repair: 'Screen Replacement', price: '₹4,999', time: '60 min' },
  { device: 'MacBook Air M2', repair: 'Battery Replacement', price: '₹5,999', time: '60 min' },
  { device: 'Galaxy S23', repair: 'Charging Port', price: '₹1,799', time: '40 min' },
  { device: 'PlayStation 5', repair: 'Software Issues', price: '₹999', time: '35 min' },
];

export default function Home() {
  const [devices, setDevices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [devicesRes, locationsRes, reviewsRes] = await Promise.all([
          api.get('/devices'),
          api.get('/locations'),
          api.get('/reviews'),
        ]);
        setDevices(devicesRes.data);
        setLocations(locationsRes.data.slice(0, 3));
        setReviews(reviewsRes.data.slice(0, 3));
      } catch (err) {
        // homepage degrades gracefully section-by-section
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPreviewIndex((i) => (i + 1) % PREVIEW_EXAMPLES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const preview = PREVIEW_EXAMPLES[previewIndex];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 to-bg">
        <div className="section pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow mb-5">
              <ShieldCheck className="w-3.5 h-3.5" /> Warrantied repairs, upfront pricing
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] text-ink-900 mb-5">
              Your device, <span className="text-primary-700">fixed right</span> — usually the same day.
            </h1>
            <p className="text-lg text-ink-500 leading-relaxed mb-8 max-w-lg">
              Screens, batteries, charging ports and more — repaired by certified technicians with
              quality-tested parts, transparent pricing, and a warranty on every job.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/book" className="btn-primary text-base px-6 py-3.5">
                Book a Repair <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/locations" className="btn-secondary text-base px-6 py-3.5">
                <MapPin className="w-4 h-4" /> Find a Store
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-8 text-sm text-ink-500">
              <div className="flex -space-x-2">
                {['A', 'P', 'S', 'R'].map((l) => (
                  <span key={l} className="w-8 h-8 rounded-full bg-primary-700 text-white text-xs font-semibold flex items-center justify-center ring-2 ring-white">
                    {l}
                  </span>
                ))}
              </div>
              <span>Trusted by 12,000+ customers across India</span>
            </div>
          </div>

          {/* Signature element: live rotating price-preview card + device mockup grid */}
          <div className="relative">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {['smartphone', 'laptop', 'tablet', 'watch', 'gamepad-2', 'cpu'].map((icon, i) => (
                <div
                  key={icon}
                  className={`card flex items-center justify-center aspect-square ${i === 1 || i === 4 ? 'bg-primary-700 text-white' : 'text-primary-700'}`}
                >
                  <DeviceIcon name={icon} className="w-8 h-8" />
                </div>
              ))}
            </div>
            <div className="card p-5 border-2 border-primary-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3">
                Live pricing example
              </p>
              <div key={previewIndex} className="animate-[fadeIn_0.4s_ease]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-semibold text-lg text-ink-900">{preview.device}</span>
                  <span className="eyebrow">{preview.repair}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-900/5">
                  <div>
                    <p className="text-2xl font-bold text-primary-700">{preview.price}</p>
                    <p className="text-xs text-ink-500">Estimated {preview.time}</p>
                  </div>
                  <Link to="/book" className="btn-accent text-sm px-4 py-2.5">
                    Book This
                  </Link>
                </div>
              </div>
              <div className="flex gap-1.5 mt-4">
                {PREVIEW_EXAMPLES.map((_, i) => (
                  <span key={i} className={`h-1 rounded-full transition-all ${i === previewIndex ? 'w-6 bg-primary-700' : 'w-1.5 bg-ink-900/10'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="section py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {TRUST_POINTS.map((t) => (
            <div key={t.title} className="card p-5 text-center hover:shadow-card-hover transition-shadow">
              <t.icon className="w-6 h-6 text-primary-700 mx-auto mb-3" />
              <p className="font-semibold text-sm text-ink-900 mb-1">{t.title}</p>
              <p className="text-xs text-ink-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEVICE CATEGORIES */}
      <section className="section py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="eyebrow mb-3">What we fix</span>
            <h2 className="text-3xl font-bold text-ink-900">Repairs for every device</h2>
          </div>
          <Link to="/devices" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <LoadingState label="Loading devices..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {devices.map((d) => (
              <Link
                key={d._id}
                to={`/book?device=${d._id}`}
                className="card p-5 flex flex-col items-center text-center gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                  <DeviceIcon name={d.icon} className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm text-ink-900">{d.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* REPAIR CATEGORIES */}
      <section className="section py-14">
        <span className="eyebrow mb-3">Common issues</span>
        <h2 className="text-3xl font-bold text-ink-900 mb-8">Repair categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {REPAIR_CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/services"
              className="card p-5 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-500/10 text-accent-600 flex items-center justify-center flex-shrink-0">
                <RepairIcon category={c} className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm text-ink-900">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-ink-900 text-white py-16 mt-8">
        <div className="section">
          <span className="eyebrow mb-3 bg-white/10 text-white">The process</span>
          <h2 className="text-3xl font-bold mb-10">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step}>
                <span className="font-display text-3xl font-bold text-primary-400">{s.step}</span>
                <p className="font-semibold mt-2 mb-1">{s.title}</p>
                <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/book" className="btn-accent mt-10 inline-flex">
            Start your booking <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {reviews.length > 0 && (
        <section className="section py-16">
          <span className="eyebrow mb-3">Customer stories</span>
          <h2 className="text-3xl font-bold text-ink-900 mb-8">What customers say</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div key={r._id} className="card p-6">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-ink-700 leading-relaxed mb-4">"{r.comment}"</p>
                <p className="text-sm font-semibold text-ink-900">{r.customerName}</p>
                <p className="text-xs text-ink-500">{r.deviceRepaired}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LOCATIONS PREVIEW */}
      {locations.length > 0 && (
        <section className="section py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow mb-3">Visit us</span>
              <h2 className="text-3xl font-bold text-ink-900">Stores near you</h2>
            </div>
            <Link to="/locations" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">
              All locations <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {locations.map((loc) => (
              <div key={loc._id} className="card p-6">
                <MapPin className="w-5 h-5 text-primary-700 mb-3" />
                <p className="font-semibold text-ink-900 mb-1">{loc.name}</p>
                <p className="text-sm text-ink-500 mb-4">{loc.address}, {loc.city}</p>
                <Link to={`/book?location=${loc._id}`} className="text-sm font-semibold text-primary-700 hover:underline">
                  Book here →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ PREVIEW */}
      <section className="section py-16">
        <span className="eyebrow mb-3">Questions</span>
        <h2 className="text-3xl font-bold text-ink-900 mb-6">Frequently asked</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="card p-5">
            <p className="font-semibold text-ink-900 mb-1">How long do repairs take?</p>
            <p className="text-sm text-ink-500">Most screen and battery repairs are done in under an hour.</p>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-ink-900 mb-1">Is there a warranty?</p>
            <p className="text-sm text-ink-500">Yes — every repair includes a written parts and labor warranty.</p>
          </div>
        </div>
        <Link to="/faq" className="text-sm font-semibold text-primary-700 hover:underline">
          Read the full FAQ →
        </Link>
      </section>

      {/* FINAL CTA */}
      <section className="section pb-20">
        <div className="card bg-primary-700 text-white p-10 lg:p-14 text-center overflow-hidden relative">
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">Ready to get your device fixed?</h2>
          <p className="text-primary-100 mb-7 max-w-lg mx-auto">
            Book online in under two minutes — pick your device, your problem, and a time that works.
          </p>
          <Link to="/book" className="btn-accent text-base px-7 py-3.5 inline-flex">
            Book a Repair <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
