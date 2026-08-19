import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="section py-24 text-center">
      <Wrench className="w-10 h-10 text-primary-700 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-ink-900 mb-2">Page not found</h1>
      <p className="text-ink-500 mb-6">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary inline-flex">Back to home</Link>
    </div>
  );
}
