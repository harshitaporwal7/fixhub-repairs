import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api, { getErrorMessage } from '../../api/client';
import { LoadingState, ErrorBanner, EmptyState, SuccessBanner } from '../../components/States';

// Configuration per entity: endpoint, display columns, and form fields.
// Select-type fields load their options from another endpoint and filter
// dependently (e.g. models depend on the chosen brand).
const CONFIG = {
  devices: {
    title: 'Devices',
    endpoint: '/devices',
    listParams: { all: 'true' },
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'slug', label: 'Slug' },
      { key: 'icon', label: 'Icon' },
      { key: 'isActive', label: 'Active', render: (v) => (v ? 'Yes' : 'No') },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      {
        name: 'icon',
        label: 'Icon',
        type: 'select',
        options: ['smartphone', 'tablet', 'laptop', 'watch', 'gamepad-2', 'cpu'],
      },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sortOrder', label: 'Sort order', type: 'number' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },
  brands: {
    title: 'Brands',
    endpoint: '/brands',
    listParams: { all: 'true' },
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'device', label: 'Device', render: (v) => v?.name || '—' },
      { key: 'isActive', label: 'Active', render: (v) => (v ? 'Yes' : 'No') },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'device', label: 'Device', type: 'relation', relation: 'devices', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },
  models: {
    title: 'Models',
    endpoint: '/models',
    listParams: { all: 'true' },
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'brand', label: 'Brand', render: (v) => v?.name || '—' },
      { key: 'device', label: 'Device', render: (v) => v?.name || '—' },
      { key: 'releaseYear', label: 'Year' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'device', label: 'Device', type: 'relation', relation: 'devices', required: true },
      { name: 'brand', label: 'Brand', type: 'relation', relation: 'brands', required: true, filterBy: 'device' },
      { name: 'releaseYear', label: 'Release year', type: 'number' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },
  repairs: {
    title: 'Repair Services',
    endpoint: '/repairs',
    listParams: { all: 'true' },
    columns: [
      { key: 'category', label: 'Category' },
      { key: 'model', label: 'Model', render: (v) => v?.name || '—' },
      { key: 'price', label: 'Price', render: (v) => `₹${Number(v).toLocaleString('en-IN')}` },
      { key: 'estimatedMinutes', label: 'Minutes' },
      { key: 'warrantyMonths', label: 'Warranty (mo)' },
    ],
    fields: [
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          'Screen Replacement', 'Battery Replacement', 'Charging Port', 'Camera Repair',
          'Speaker/Microphone', 'Water Damage', 'Software Issues', 'Back Glass', 'Other Repairs',
        ],
      },
      { name: 'name', label: 'Display name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'device', label: 'Device', type: 'relation', relation: 'devices', required: true },
      { name: 'brand', label: 'Brand', type: 'relation', relation: 'brands', required: true, filterBy: 'device' },
      { name: 'model', label: 'Model', type: 'relation', relation: 'models', required: true, filterBy: 'brand' },
      { name: 'price', label: 'Price (₹)', type: 'number', required: true },
      { name: 'estimatedMinutes', label: 'Estimated minutes', type: 'number', required: true },
      { name: 'warrantyMonths', label: 'Warranty (months)', type: 'number', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },
  locations: {
    title: 'Locations',
    endpoint: '/locations',
    listParams: { all: 'true' },
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'city', label: 'City' },
      { key: 'phone', label: 'Phone' },
      { key: 'isActive', label: 'Active', render: (v) => (v ? 'Yes' : 'No') },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text' },
      { name: 'postalCode', label: 'Postal code', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },
};

const RELATION_ENDPOINTS = {
  devices: '/devices',
  brands: '/brands',
  models: '/models',
};

export default function AdminCrud({ entity }) {
  const config = CONFIG[entity];
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [relationOptions, setRelationOptions] = useState({});

  async function load() {
    setStatus('loading');
    try {
      const { data } = await api.get(config.endpoint, { params: config.listParams });
      setItems(data);
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
    // Preload every relation type this entity's fields might need
    const relations = [...new Set((config.fields || []).filter((f) => f.type === 'relation').map((f) => f.relation))];
    relations.forEach((rel) => {
      api.get(RELATION_ENDPOINTS[rel], { params: { all: 'true' } }).then(({ data }) => {
        setRelationOptions((prev) => ({ ...prev, [rel]: data }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setModalOpen(true);
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name || item.category}"? This cannot be undone.`)) return;
    try {
      await api.delete(`${config.endpoint}/${item._id}`);
      setItems((list) => list.filter((i) => i._id !== item._id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{config.title}</h1>
          <p className="text-sm text-ink-500">{items.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add {config.title.replace(/s$/, '')}
        </button>
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorBanner message={error} onRetry={load} />}
      {status === 'ready' && items.length === 0 && (
        <EmptyState title={`No ${config.title.toLowerCase()} yet`} action={<button onClick={openCreate} className="btn-primary">Add one</button>} />
      )}

      {status === 'ready' && items.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-ink-500">
                {config.columns.map((c) => (
                  <th key={c.key} className="px-5 py-3 font-medium">{c.label}</th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.02]">
                  {config.columns.map((c) => (
                    <td key={c.key} className="px-5 py-3 text-ink-900">
                      {c.render ? c.render(item[c.key]) : String(item[c.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-ink-900/5 text-ink-500" aria-label="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" aria-label="Delete">
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

      {modalOpen && (
        <CrudModal
          config={config}
          item={editing}
          relationOptions={relationOptions}
          onClose={() => setModalOpen(false)}
          onSaved={(saved) => {
            setModalOpen(false);
            setItems((list) => {
              const exists = list.some((i) => i._id === saved._id);
              return exists ? list.map((i) => (i._id === saved._id ? saved : i)) : [saved, ...list];
            });
          }}
        />
      )}
    </div>
  );
}

function CrudModal({ config, item, relationOptions, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState(() => {
    const initial = {};
    config.fields.forEach((f) => {
      if (f.type === 'relation') {
        initial[f.name] = item?.[f.name]?._id || item?.[f.name] || '';
      } else if (f.type === 'checkbox') {
        initial[f.name] = item ? Boolean(item[f.name]) : true;
      } else {
        initial[f.name] = item?.[f.name] ?? '';
      }
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function filteredOptions(field) {
    const options = relationOptions[field.relation] || [];
    if (!field.filterBy || !form[field.filterBy]) return options;
    return options.filter((o) => {
      const parentField = o[field.filterBy];
      const parentId = parentField?._id || parentField;
      return parentId === form[field.filterBy];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      config.fields.forEach((f) => {
        if (f.type === 'number' && payload[f.name] !== '') payload[f.name] = Number(payload[f.name]);
      });
      const { data } = isEdit
        ? await api.put(`${config.endpoint}/${item._id}`, payload)
        : await api.post(config.endpoint, payload);
      onSaved(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-900/10 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-semibold text-ink-900">{isEdit ? `Edit ${config.title.replace(/s$/, '')}` : `Add ${config.title.replace(/s$/, '')}`}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-900/5"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorBanner message={error} />}
          {config.fields.map((f) => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              {f.type === 'text' || f.type === 'number' ? (
                <input
                  type={f.type}
                  required={f.required}
                  className="input"
                  value={form[f.name]}
                  onChange={(e) => update(f.name, e.target.value)}
                />
              ) : f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  className="input resize-none"
                  value={form[f.name]}
                  onChange={(e) => update(f.name, e.target.value)}
                />
              ) : f.type === 'select' ? (
                <select required={f.required} className="input" value={form[f.name]} onChange={(e) => update(f.name, e.target.value)}>
                  <option value="">Select...</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === 'relation' ? (
                <select
                  required={f.required}
                  className="input"
                  value={form[f.name]}
                  onChange={(e) => update(f.name, e.target.value)}
                >
                  <option value="">Select...</option>
                  {filteredOptions(f).map((o) => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                  ))}
                </select>
              ) : f.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <input type="checkbox" checked={form[f.name]} onChange={(e) => update(f.name, e.target.checked)} />
                  Active
                </label>
              ) : null}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
