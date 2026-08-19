import { Star } from 'lucide-react';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Repair': 'bg-primary-50 text-primary-700 border-primary-200',
  'Ready for Pickup': 'bg-accent-500/10 text-accent-600 border-accent-500/30',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-ink-900/5 text-ink-700 border-ink-900/10';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

export function StarRating({ rating, size = 'w-4 h-4', onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((n) => (
        <button
          type="button"
          key={n}
          disabled={!onChange}
          onClick={() => onChange && onChange(n)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${n} star`}
        >
          <Star
            className={`${size} ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-ink-300'}`}
          />
        </button>
      ))}
    </div>
  );
}
