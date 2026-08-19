import { Loader2, Inbox, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-500">
      <Loader2 className="w-7 h-7 animate-spin mb-3 text-primary-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, icon: IconComp = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-ink-900/5 flex items-center justify-center mb-4">
        <IconComp className="w-6 h-6 text-ink-500" />
      </div>
      <h3 className="font-semibold text-ink-900 mb-1">{title}</h3>
      {message && <p className="text-sm text-ink-500 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 font-semibold underline underline-offset-2">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function SuccessBanner({ message }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p>{message}</p>
    </div>
  );
}
