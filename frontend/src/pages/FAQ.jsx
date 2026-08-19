import { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { EmptyState } from '../components/States';

const FAQS = [
  { category: 'Repairs', q: 'How long does a typical repair take?', a: 'Most screen and battery repairs are completed in 45–90 minutes. Water damage and complex logic-board repairs can take 1–2 business days.' },
  { category: 'Repairs', q: 'Do you use original parts?', a: 'We use quality-tested, warrantied parts. Where original manufacturer parts are available, we offer them as an upgrade option at checkout.' },
  { category: 'Repairs', q: 'What if my device has other damage you find during repair?', a: "We'll always call or message you with a revised quote before doing any additional work — nothing extra is charged without your approval." },
  { category: 'Pricing', q: 'Is the price shown at booking the final price?', a: 'Yes, for the specific issue selected. If our technician finds additional damage, we will quote that separately before proceeding.' },
  { category: 'Pricing', q: 'Do you offer any discounts?', a: 'We periodically run seasonal offers, and returning customers get a small loyalty discount automatically applied at checkout.' },
  { category: 'Warranty', q: 'What does the warranty cover?', a: 'Our warranty covers the part replaced and the labor performed, for the number of months shown at booking (typically 6 months).' },
  { category: 'Warranty', q: 'What voids the warranty?', a: 'Physical damage after the repair (new drops, liquid exposure) or repairs attempted by a third party will void the warranty on that specific repair.' },
  { category: 'Booking', q: 'Do I need an appointment?', a: 'Walk-ins are welcome, but booking online guarantees your time slot and lets us have your parts ready when you arrive.' },
  { category: 'Booking', q: 'Can I reschedule or cancel my booking?', a: 'Yes — go to My Bookings in your account, or use the booking ID and email from your confirmation to manage it.' },
  { category: 'Payments', q: 'What payment methods do you accept?', a: 'All major cards, UPI, and cash are accepted in-store. Online prepayment is optional at checkout.' },
  { category: 'Payments', q: 'Do you offer refunds?', a: 'If we are unable to complete a repair, any prepayment is refunded in full within 3–5 business days.' },
  { category: 'Locations', q: 'Which cities do you operate in?', a: 'We currently have stores in Chandigarh, New Delhi, Mumbai, Bengaluru and Pune, with more opening soon.' },
  { category: 'Locations', q: 'Can I drop off at one store and pick up at another?', a: 'Not currently — each booking is tied to the store location you select at checkout.' },
  { category: 'Devices', q: 'Which devices do you repair?', a: 'iPhones, iPads, MacBooks, Samsung and Google Pixel phones, Windows laptops, tablets, smartwatches and game consoles.' },
  { category: 'Devices', q: "My device isn't listed — can you still help?", a: 'Select "Other Devices" when booking and describe the issue in the notes — our technicians will assess it in-store.' },
];

const CATEGORIES = ['All', ...new Set(FAQS.map((f) => f.category))];

export default function FAQ() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      const catOk = category === 'All' || f.category === category;
      const q = query.trim().toLowerCase();
      const searchOk = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [query, category]);

  return (
    <div className="section py-14 max-w-3xl">
      <span className="eyebrow mb-3">Help center</span>
      <h1 className="text-4xl font-bold text-ink-900 mb-3">Frequently asked questions</h1>
      <p className="text-ink-500 mb-8">Search or browse by category to find your answer.</p>

      <div className="relative mb-5">
        <Search className="w-4 h-4 text-ink-300 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions..."
          className="input pl-11"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === c ? 'bg-primary-700 text-white' : 'bg-white text-ink-700 border border-ink-900/10 hover:bg-ink-900/5'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No matching questions" message="Try a different search term or category." />
      ) : (
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <div key={f.q} className="card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-ink-900">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-ink-500 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-ink-500 leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
