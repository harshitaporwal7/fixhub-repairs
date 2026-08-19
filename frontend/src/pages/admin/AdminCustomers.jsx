import { useEffect, useState } from 'react';
import { Search, Trash2, UserX, UserCheck } from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { LoadingState, ErrorBanner, EmptyState } from '../../components/States';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setStatus('loading');
    try {
      const params = search.trim() ? { search: search.trim() } : {};
      const { data } = await api.get('/admin/customers', { params });
      setCustomers(data);
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function toggleActive(customer) {
    try {
      const { data } = await api.put(`/admin/customers/${customer._id}`, { isActive: !customer.isActive });
      setCustomers((list) => list.map((c) => (c._id === data._id ? data : c)));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.name}'s account? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/customers/${customer._id}`);
      setCustomers((list) => list.filter((c) => c._id !== customer._id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Customers</h1>
      <p className="text-sm text-ink-500 mb-6">{customers.length} customer accounts</p>

      <div className="relative mb-6 w-72">
        <Search className="w-4 h-4 text-ink-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-10" />
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorBanner message={error} onRetry={load} />}
      {status === 'ready' && customers.length === 0 && <EmptyState title="No customers found" />}

      {status === 'ready' && customers.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-ink-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.02]">
                  <td className="px-5 py-3 text-ink-900 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-ink-700">{c.email}</td>
                  <td className="px-5 py-3 text-ink-700">{c.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActive(c)} className="p-2 rounded-lg hover:bg-ink-900/5 text-ink-500" title={c.isActive ? 'Disable account' : 'Activate account'}>
                        {c.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
