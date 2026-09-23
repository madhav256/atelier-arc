import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, date, label, money } from '../lib/api';
import { Field, FormError } from '../components/Form';
import { Loading, ErrorState, Empty } from '../components/States';
import { RESOURCE_META, toForm, fromForm } from './resources';

const cell = (v) => (typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v == null || v === '' ? '—' : String(v).match(/^\d{4}-\d\d-\d\dT/) ? date(v) : typeof v === 'number' ? v.toLocaleString('en-IN') : v);

export function Pager({ meta, setPage }) {
  if (!meta || meta.pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pages">
      <button disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
        Previous
      </button>
      <span>
        Page {meta.page} of {meta.pages}
      </span>
      <button disabled={meta.page >= meta.pages} onClick={() => setPage(meta.page + 1)}>
        Next
      </button>
    </nav>
  );
}

export function useAdminList(resource, extra = {}) {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const qs = new URLSearchParams({ page, limit: 25, ...Object.fromEntries(params), ...extra });
  const q = useQuery({ queryKey: ['admin', resource, qs.toString()], queryFn: () => api(`/admin/${resource}?${qs}`, { raw: true }), placeholderData: (prev) => prev });
  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    if (k !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  return { q, params, setParam, setPage: (p) => setParam('page', String(p)) };
}

export function ResourceList({ canWrite }) {
  const { resource } = useParams();
  const meta = RESOURCE_META[resource];
  const qc = useQueryClient();
  const { q, params, setParam, setPage } = useAdminList(resource);
  const [selected, setSelected] = useState([]);
  const bulk = useMutation({
    mutationFn: (action) => api(`/admin/${resource}/bulk`, { body: { ids: selected, action } }),
    onSuccess: () => (setSelected([]), qc.invalidateQueries({ queryKey: ['admin', resource] })),
  });
  if (!meta) return <Empty title="Unknown section" />;
  const rows = q.data?.data || [];
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <>
      <div className="admin-head">
        <h1>{meta.label}</h1>
        {canWrite && !meta.readOnlyCreate && (
          <Link className="button small" to={`/admin/${resource}/new`}>
            New
          </Link>
        )}
      </div>
      <div className="admin-filters">
        <Field label="Search" type="search" defaultValue={params.get('q') || ''} onChange={(e) => setParam('q', e.target.value)} />
        {Object.entries(meta.filters || {}).map(([k, opts]) => (
          <Field key={k} label={label(k)} as="select" value={params.get(k) || ''} onChange={(e) => setParam(k, e.target.value)}>
            <option value="">All</option>
            {opts.map((o) => (
              <option key={o} value={o}>
                {label(o)}
              </option>
            ))}
          </Field>
        ))}
      </div>
      {canWrite && meta.bulk && selected.length > 0 && (
        <div className="bulk-bar" role="region" aria-label="Bulk actions">
          {selected.length} selected
          {meta.bulk.map((a) => (
            <button key={a} className="button ghost small" onClick={() => bulk.mutate(a)} disabled={bulk.isPending}>
              {label(a)}
            </button>
          ))}
        </div>
      )}
      <FormError error={bulk.error} />
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : rows.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">{meta.label}</caption>
            <thead>
              <tr>
                {canWrite && meta.bulk && (
                  <th scope="col">
                    <input type="checkbox" aria-label="Select all on this page" checked={selected.length === rows.length} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r._id) : [])} />
                  </th>
                )}
                {meta.columns.map(([k, h]) => (
                  <th scope="col" key={k}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  {canWrite && meta.bulk && (
                    <td>
                      <input type="checkbox" aria-label={`Select ${meta.title(r)}`} checked={selected.includes(r._id)} onChange={() => toggle(r._id)} />
                    </td>
                  )}
                  {meta.columns.map(([k, , fn], i) => (
                    <td key={k}>{i === 0 ? <Link to={`/admin/${resource}/${r._id}`}>{cell(fn ? fn(r) : r[k])}</Link> : k === 'price' ? (r.priceOnRequest ? 'On request' : money(r.price, r.currency)) : cell(fn ? fn(r) : r[k])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="Nothing found" text="Try a different search or filter." />
      )}
      <Pager meta={q.data?.meta} setPage={setPage} />
    </>
  );
}

function ImageUpload({ onUploaded, alt }) {
  const [error, setError] = useState(null);
  const up = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('alt', alt || '');
      return api('/admin/uploads', { body: fd });
    },
    onSuccess: onUploaded,
    onError: setError,
  });
  return (
    <div className="upload">
      <label className="button ghost small">
        {up.isPending ? 'Uploading…' : 'Upload image'}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => e.target.files[0] && up.mutate(e.target.files[0])} />
      </label>
      <FormError error={error} />
    </div>
  );
}

function Input({ def, value, onChange, error, artists }) {
  const [, text, kind, opts = {}] = def;
  const common = { label: text, error, required: opts.required };
  if (kind === 'bool')
    return (
      <label className="switch">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {text}
      </label>
    );
  if (kind === 'select')
    return (
      <Field {...common} as="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {opts.options.map((o) => (
          <option key={o} value={o}>
            {o ? label(o) : '—'}
          </option>
        ))}
      </Field>
    );
  if (kind === 'artist')
    return (
      <Field {...common} as="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose an artist</option>
        {(artists || []).map((a) => (
          <option key={a._id} value={a._id}>
            {a.name}
          </option>
        ))}
      </Field>
    );
  if (kind === 'image')
    return (
      <div className="field">
        <Field {...common} type="url" value={value} onChange={(e) => onChange(e.target.value)} hint="Paste a URL or upload" />
        {value && <img src={value} alt="" className="thumb" />}
        <ImageUpload onUploaded={(img) => onChange(img.url)} />
      </div>
    );
  if (kind === 'images')
    return (
      <fieldset className="field images-field">
        <legend>{text}</legend>
        <ul>
          {value.map((img, i) => (
            <li key={img.url + i}>
              <img src={img.url} alt="" className="thumb" />
              <Field label={`Alt text for image ${i + 1}`} value={img.alt || ''} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
              <button type="button" className="text-button" disabled={i === 0} onClick={() => onChange([value[i], ...value.filter((_, j) => j !== i)])}>
                Make primary
              </button>{' '}
              <button type="button" className="text-button" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <ImageUpload onUploaded={(img) => onChange([...value, img])} />
      </fieldset>
    );
  const as = kind === 'textarea' || kind === 'lines' || kind === 'timeline' ? 'textarea' : 'input';
  const type = kind === 'number' ? 'number' : kind === 'date' ? 'date' : 'text';
  return <Field {...common} as={as} rows={as === 'textarea' ? opts.rows || 5 : undefined} type={as === 'input' ? type : undefined} step={kind === 'number' ? 'any' : undefined} value={value} onChange={(e) => onChange(e.target.value)} />;
}

export function ResourceForm({ canWrite }) {
  const { resource, id } = useParams();
  const isNew = id === 'new';
  const meta = RESOURCE_META[resource];
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ['admin', resource, 'item', id], queryFn: () => api(`/admin/${resource}/${id}`), enabled: !isNew });
  const artists = useQuery({ queryKey: ['admin', 'artists', 'options'], queryFn: () => api('/admin/artists?limit=100&sort=name'), enabled: resource === 'artworks' });
  const [form, setForm] = useState(null);
  const current = form ?? (isNew ? toForm({ published: true, currency: 'INR', stock: 1, dimensions: { unit: 'cm' }, availability: 'available' }, meta.fields) : q.data && toForm(q.data, meta.fields));
  const save = useMutation({
    mutationFn: () => {
      const body = fromForm(current, meta.fields);
      if (isNew) return api(`/admin/${resource}`, { body });
      // Send only what changed, so the audit log records real edits.
      const before = fromForm(toForm(q.data, meta.fields), meta.fields);
      const changed = Object.fromEntries(Object.entries(body).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(before[k])));
      return api(`/admin/${resource}/${id}`, { method: 'PATCH', body: changed });
    },
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ['admin', resource] });
      setForm(null);
      if (isNew) navigate(`/admin/${resource}/${item._id}`, { replace: true });
    },
  });
  const remove = useMutation({
    mutationFn: () => api(`/admin/${resource}/${id}`, { method: 'DELETE' }),
    onSuccess: () => (qc.invalidateQueries({ queryKey: ['admin', resource] }), navigate(`/admin/${resource}`)),
  });
  if (!isNew && q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const fe = save.error?.fieldErrors || {};
  return (
    <>
      <Link to={`/admin/${resource}`}>← {meta.label}</Link>
      <div className="admin-head">
        <h1>{isNew ? `New ${meta.label.toLowerCase().replace(/s$/, '')}` : meta.title(q.data)}</h1>
        {!isNew && q.data?.slug && resource !== 'customers' && (
          <a href={`/${resource === 'articles' ? 'journal' : resource}/${q.data.slug}`} target="_blank" rel="noopener noreferrer">
            View on site
          </a>
        )}
      </div>
      {resource === 'customers' && q.data && <p className="muted">{q.data.email} · joined {date(q.data.createdAt)}</p>}
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <fieldset disabled={!canWrite}>
          {meta.fields.map((def) => (
            <Input key={def[0]} def={def} value={current[def[0]]} error={fe[def[0].split('.')[0]]} artists={artists.data} onChange={(v) => setForm({ ...current, [def[0]]: v })} />
          ))}
        </fieldset>
        <FormError error={save.error} />
        {save.isSuccess && !form && <p role="status">Saved.</p>}
        {canWrite && (
          <div className="form-actions">
            <button className="button" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save'}
            </button>
            {!isNew && resource !== 'customers' && (
              <button type="button" className="button ghost" onClick={() => confirm('Delete this item? This cannot be undone.') && remove.mutate()}>
                Delete
              </button>
            )}
          </div>
        )}
        <FormError error={remove.error} />
      </form>
    </>
  );
}
