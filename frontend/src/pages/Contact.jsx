import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { SuccessBanner, ErrorBanner } from '../components/States';

const initialForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setErrorMsg(getErrorMessage(err));
    }
  }

  return (
    <div className="section py-14">
      <span className="eyebrow mb-3">Get in touch</span>
      <h1 className="text-4xl font-bold text-ink-900 mb-3">Contact us</h1>
      <p className="text-ink-500 max-w-lg mb-10">
        Questions about a repair, pricing, or a store? Send us a message and we'll reply within one business day.
      </p>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5 flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary-700 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-ink-900">Call us</p>
              <p className="text-sm text-ink-500">+91 172 400 1234</p>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary-700 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-ink-900">Email us</p>
              <p className="text-sm text-ink-500">support@fixhubrepairs.com</p>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary-700 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-ink-900">Visit a store</p>
              <p className="text-sm text-ink-500">Chandigarh · Delhi · Mumbai · Bengaluru · Pune</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 card p-6 sm:p-8 space-y-5">
          {status === 'success' && (
            <SuccessBanner message="Thanks for reaching out — we'll get back to you shortly." />
          )}
          {status === 'error' && <ErrorBanner message={errorMsg} />}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Name</label>
              <input required className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input required type="email" className="input" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Phone (optional)</label>
            <input className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Subject</label>
            <input required className="input" value={form.subject} onChange={(e) => update('subject', e.target.value)} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea required rows={5} className="input resize-none" value={form.message} onChange={(e) => update('message', e.target.value)} />
          </div>
          <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full sm:w-auto">
            <Send className="w-4 h-4" /> {status === 'submitting' ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  );
}
