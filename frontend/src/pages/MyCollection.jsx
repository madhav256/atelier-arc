import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArtworkCard } from '../components/ArtworkCard';
import { Empty, Loading, ErrorState } from '../components/States';
import { Field, FormError } from '../components/Form';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useCollection } from '../hooks/useCollection';
import { api } from '../lib/api';

function useListMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ['collections'] });
  return {
    create: useMutation({ mutationFn: (body) => api('/me/collections', { body }), onSuccess: done }),
    update: useMutation({ mutationFn: ({ id, ...body }) => api(`/me/collections/${id}`, { method: 'PATCH', body }), onSuccess: done }),
    remove: useMutation({ mutationFn: (id) => api(`/me/collections/${id}`, { method: 'DELETE' }), onSuccess: done }),
    note: useMutation({ mutationFn: ({ id, artworkId, note }) => api(`/me/collections/${id}/items/${artworkId}`, { method: 'PATCH', body: { note } }), onSuccess: done }),
    removeItem: useMutation({ mutationFn: ({ id, artworkId }) => api(`/me/collections/${id}/items/${artworkId}`, { method: 'DELETE' }), onSuccess: done }),
    move: useMutation({ mutationFn: ({ to, artworkId, note }) => api(`/me/collections/${to}/items`, { body: { artworkId, note } }), onSuccess: done }),
  };
}

function NoteEditor({ list, item, m }) {
  const [note, setNote] = useState(item.note || '');
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <div className="item-note">
        {item.note ? <p>{item.note}</p> : null}
        <button className="text-button" onClick={() => setOpen(true)}>
          {item.note ? 'Edit note' : 'Add a note'}
        </button>
      </div>
    );
  return (
    <form
      className="item-note"
      onSubmit={(e) => {
        e.preventDefault();
        m.note.mutate({ id: list._id, artworkId: item.artwork._id, note }, { onSuccess: () => setOpen(false) });
      }}
    >
      <Field label={`Note on ${item.artwork.title}`} as="textarea" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="button small">Save note</button>{' '}
      <button type="button" className="text-button" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}

function ListView({ list, lists, m }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description || '');
  const shareUrl = list.shareToken ? `${location.origin}/shared/${list.shareToken}` : '';
  const [copied, setCopied] = useState(false);
  const items = list.items.filter((i) => i.artwork);
  return (
    <section className="list-view" aria-labelledby={`list-${list._id}`}>
      <div className="section-head">
        {editing ? (
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              m.update.mutate({ id: list._id, name, description }, { onSuccess: () => setEditing(false) });
            }}
          >
            <Field label="List name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
            <Field label="Description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
            <button className="button small">Save</button>
            <FormError error={m.update.error} />
          </form>
        ) : (
          <div>
            <h2 id={`list-${list._id}`}>{list.name}</h2>
            {list.description && <p className="muted">{list.description}</p>}
            <p className="muted">
              {items.length} {items.length === 1 ? 'work' : 'works'}
            </p>
          </div>
        )}
        <div className="collection-actions">
          <button className="button ghost small" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Close' : 'Rename'}
          </button>
          <label className="switch">
            <input type="checkbox" checked={list.isPublic} onChange={(e) => m.update.mutate({ id: list._id, isPublic: e.target.checked })} /> Share with a private link
          </label>
          {lists.length > 1 && (
            <button className="button ghost small" onClick={() => confirm(`Delete "${list.name}"? Works stay in the catalogue.`) && m.remove.mutate(list._id)}>
              Delete list
            </button>
          )}
        </div>
      </div>
      {list.isPublic && shareUrl && (
        <p className="notice">
          Anyone with this link can see this list, your notes and your first name:{' '}
          <a href={shareUrl}>{shareUrl}</a>{' '}
          <button className="text-button" onClick={() => navigator.clipboard?.writeText(shareUrl).then(() => setCopied(true))}>
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </p>
      )}
      {items.length ? (
        <div className="art-grid">
          {items.map((item, i) => (
            <div key={item.artwork._id} className="saved-item">
              <ArtworkCard artwork={item.artwork} index={i} />
              <NoteEditor list={list} item={item} m={m} />
              <div className="saved-item-actions">
                {lists.length > 1 && (
                  <select
                    aria-label={`Copy ${item.artwork.title} to another list`}
                    defaultValue=""
                    onChange={(e) => e.target.value && m.move.mutate({ to: e.target.value, artworkId: item.artwork._id, note: item.note })}
                  >
                    <option value="">Copy to list…</option>
                    {lists
                      .filter((l) => l._id !== list._id)
                      .map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.name}
                        </option>
                      ))}
                  </select>
                )}
                <button className="text-button" onClick={() => m.removeItem.mutate({ id: list._id, artworkId: item.artwork._id })}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Nothing saved here yet.</p>
      )}
    </section>
  );
}

export default function MyCollection() {
  useDocumentMeta('My Collection', 'Your private selection of artworks.', { noindex: true });
  const { user, lists, local, loading } = useCollection();
  const m = useListMutations();
  const [newName, setNewName] = useState('');
  if (loading) return <Loading />;
  if (!user)
    return (
      <section className="plain-page">
        <span className="eyebrow">PRIVATE COLLECTION</span>
        <h1>My Collection</h1>
        <p className="lede">Works you save are kept on this device. Sign in to keep them across devices, add notes, create lists and share them with your advisor.</p>
        <p>
          <Link className="button" to="/login?next=/my-collection">
            Sign in to keep your collection
          </Link>
        </p>
        {local.length ? (
          <div className="art-grid">
            {local.map((x, i) => (
              <ArtworkCard artwork={x} index={i} key={x.slug} />
            ))}
          </div>
        ) : (
          <Empty title="Your collection is waiting" text="Save works from the catalogue to consider them here." action={<Link className="button ghost" to="/artworks">Browse works</Link>} />
        )}
      </section>
    );
  return (
    <section className="plain-page">
      <span className="eyebrow">PRIVATE COLLECTION</span>
      <h1>My Collection</h1>
      <p className="lede">Keep works under consideration, add notes, and share a selection with your advisor.</p>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          m.create.mutate({ name: newName }, { onSuccess: () => setNewName('') });
        }}
      >
        <Field label="New list" placeholder="For the living room" value={newName} onChange={(e) => setNewName(e.target.value)} required maxLength={80} />
        <button className="button small" disabled={m.create.isPending}>
          Create list
        </button>
        <Link className="button ghost small" to="/advisory">
          Request advisor review
        </Link>
      </form>
      <FormError error={m.create.error} />
      {lists.map((list) => (
        <ListView key={list._id} list={list} lists={lists} m={m} />
      ))}
    </section>
  );
}

export function SharedCollection() {
  const { token } = useParams();
  const q = useQuery({ queryKey: ['shared', token], queryFn: () => api(`/shared/collections/${token}`) });
  useDocumentMeta(q.data ? `${q.data.name}` : 'Shared collection', q.data?.description, { noindex: true });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} />;
  const s = q.data;
  return (
    <section className="plain-page">
      <span className="eyebrow">SHARED SELECTION{s.owner ? ` · FROM ${s.owner.toUpperCase()}` : ''}</span>
      <h1>{s.name}</h1>
      {s.description && <p className="lede">{s.description}</p>}
      <div className="art-grid">
        {s.items.map((item, i) => (
          <div key={item.artwork._id} className="saved-item">
            <ArtworkCard artwork={item.artwork} index={i} />
            {item.note && <p className="item-note">{item.note}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
