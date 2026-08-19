import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/States';

const initialForm = { name: '', email: '', password: '', phone: '' };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await register(form);
    setSubmitting(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="section py-16 max-w-md">
      <span className="eyebrow mb-3">Join FixHub</span>
      <h1 className="text-3xl font-bold text-ink-900 mb-2">Create your account</h1>
      <p className="text-ink-500 mb-8">Book faster and track every repair in one place.</p>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        {error && <ErrorBanner message={error} />}
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input required type="email" className="input" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input required type="password" minLength={6} className="input" value={form.password} onChange={(e) => update('password', e.target.value)} />
          <p className="text-xs text-ink-500 mt-1">At least 6 characters.</p>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          <UserPlus className="w-4 h-4" /> {submitting ? 'Creating account...' : 'Create account'}
        </button>
        <p className="text-sm text-ink-500 text-center">
          Already have an account? <Link to="/login" className="font-semibold text-primary-700 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
