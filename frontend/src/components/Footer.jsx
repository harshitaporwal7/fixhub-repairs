import { Link } from 'react-router-dom';
import { Wrench, Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-white mt-24">
      <div className="section py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg mb-3">
            <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Wrench className="w-4.5 h-4.5" strokeWidth={2.5} />
            </span>
            FixHub Repairs
          </Link>
          <p className="text-sm text-white/60 leading-relaxed">
            Certified technicians, quality-tested parts, and a warranty on every repair — screens,
            batteries and hardware fixed the right way.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide text-white/90">Company</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/about" className="hover:text-white">About us</Link></li>
            <li><Link to="/locations" className="hover:text-white">Locations</Link></li>
            <li><Link to="/reviews" className="hover:text-white">Reviews</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide text-white/90">Support</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link to="/track" className="hover:text-white">Track a booking</Link></li>
            <li><Link to="/services" className="hover:text-white">Repair pricing</Link></li>
            <li><Link to="/book" className="hover:text-white">Book a repair</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm tracking-wide text-white/90">Get in touch</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> Stores across Chandigarh, Delhi, Mumbai, Bengaluru &amp; Pune
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 flex-shrink-0" /> +91 172 400 1234
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0" /> support@fixhubrepairs.com
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="section py-5 text-xs text-white/40 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} FixHub Repairs. All rights reserved.</p>
          <p>An independent repair service, not affiliated with any device manufacturer.</p>
        </div>
      </div>
    </footer>
  );
}
