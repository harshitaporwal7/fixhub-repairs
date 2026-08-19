import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/States';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      const redirectTo = location.state?.from?.pathname || (result.user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="section py-16 max-w-md">
      <span className="eyebrow mb-3">Welcome back</span>
      <h1 className="text-3xl font-bold text-ink-900 mb-2">Log in to your account</h1>
      <p className="text-ink-500 mb-8">Track your bookings and manage your profile.</p>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        {error && <ErrorBanner message={error} />}
        <div>
          <label className="label">Email</label>
          <input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input required type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          <LogIn className="w-4 h-4" /> {submitting ? 'Logging in...' : 'Log in'}
        </button>
        <p className="text-sm text-ink-500 text-center">
          Don't have an account? <Link to="/register" className="font-semibold text-primary-700 hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
