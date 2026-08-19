import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Wrench, Leaf, ArrowRight } from 'lucide-react';

const VALUES = [
  { icon: ShieldCheck, title: 'Honest diagnostics', desc: "We tell you what's actually wrong before we quote a price — no upselling." },
  { icon: Wrench, title: 'Real craftsmanship', desc: 'Every technician is trained and tested before touching a customer device.' },
  { icon: Users, title: 'Built around you', desc: 'Online booking, live status updates, and a warranty you can actually use.' },
  { icon: Leaf, title: 'Repair over replace', desc: 'Fixing a device instead of replacing it is better for your wallet and the planet.' },
];

export default function About() {
  return (
    <div>
      <section className="section py-16">
        <span className="eyebrow mb-3">About FixHub</span>
        <h1 className="text-4xl lg:text-5xl font-bold text-ink-900 mb-5 max-w-2xl">
          We started FixHub because repairs shouldn't feel like a gamble.
        </h1>
        <p className="text-lg text-ink-500 max-w-2xl leading-relaxed">
          Too many repair shops quote one price and charge another, or use parts that fail in a
          month. FixHub was built to fix that — upfront pricing, certified technicians, and a
          warranty that means something, across every store we operate.
        </p>
      </section>

      <section className="section pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="card p-6">
              <v.icon className="w-6 h-6 text-primary-700 mb-4" />
              <h3 className="font-semibold text-ink-900 mb-1.5">{v.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-900 text-white py-16">
        <div className="section grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-display font-bold text-primary-400">50,000+</p>
            <p className="text-white/60 text-sm mt-1">Devices repaired</p>
          </div>
          <div>
            <p className="text-4xl font-display font-bold text-primary-400">5</p>
            <p className="text-white/60 text-sm mt-1">Cities across India</p>
          </div>
          <div>
            <p className="text-4xl font-display font-bold text-primary-400">4.8/5</p>
            <p className="text-white/60 text-sm mt-1">Average customer rating</p>
          </div>
        </div>
      </section>

      <section className="section py-16 text-center">
        <h2 className="text-3xl font-bold text-ink-900 mb-4">Ready when you are</h2>
        <Link to="/book" className="btn-primary inline-flex text-base px-6 py-3.5">
          Book a Repair <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
