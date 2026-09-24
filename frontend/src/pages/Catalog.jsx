import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api, label } from '../lib/api';
import { applyPriceParam, bandForPriceParam } from '../lib/priceBands';
import { ArtworkCard } from '../components/ArtworkCard';
import { Loading, ErrorState, Empty } from '../components/States';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// Same ranges as the "Browse by price" tiles on the home page.
const PRICE_BANDS = [
  ['', '', 'Any price'],
  ['', '50000', 'Under ₹50,000'],
  ['50000', '100000', '₹50,000 – ₹1L'],
  ['100000', '500000', '₹1L – ₹5L'],
  ['500000', '1000000', '₹5L – ₹10L'],
  ['1000000', '', '₹10L+'],
];

// Themed replacement for the native artist <select>: same look closed,
// and an on-theme open state instead of the OS picker. Follows the APG
// collapsible-listbox pattern (focus stays on the button, aria-activedescendant
// tracks the highlighted option).
function ArtistSelect({ artists, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);
  const options = [{ _id: '', name: 'All artists' }, ...artists];
  const selected = Math.max(0, options.findIndex((o) => o._id === value));

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`artist-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (i) => {
    onChange(options[i]._id);
    setOpen(false);
  };
  const openList = () => {
    setActive(selected);
    setOpen(true);
  };
  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((active + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((active - 1 + options.length) % options.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="artist-select" ref={box}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open ? `artist-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {options[selected].name}
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <ul role="listbox" aria-label="Artist">
          {options.map((o, i) => (
            <li
              key={o._id || 'all'}
              id={`artist-opt-${i}`}
              role="option"
              aria-selected={i === selected}
              className={i === active ? 'active' : ''}
              onPointerDown={(e) => {
                e.preventDefault();
                choose(i);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {o.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Catalog() {
  useDocumentMeta('Artworks', 'Browse original paintings, sculpture, works on paper, photography and editions.');
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const search = useRef(null);
  const apiParams = applyPriceParam(params);
  apiParams.delete('focus');
  if (!apiParams.get('limit')) apiParams.set('limit', '24');
  const query = useQuery({ queryKey: ['artworks', apiParams.toString()], queryFn: () => api(`/artworks?${apiParams}`, { raw: true }), placeholderData: keepPreviousData });
  const facets = useQuery({ queryKey: ['facets'], queryFn: () => api('/artworks/facets'), staleTime: 5 * 60_000 });
  useEffect(() => {
    if (params.get('focus') === 'search') search.current?.focus();
  }, [params]);
  const works = query.data?.data || [];
  const meta = query.data?.meta;
  const set = (updates) => {
    const n = new URLSearchParams(params);
    n.delete('focus');
    n.delete('price');
    for (const [k, v] of Object.entries(updates)) (v ? n.set(k, v) : n.delete(k));
    if (!('page' in updates)) n.delete('page');
    setParams(n);
  };
  const toggleList = (key, value) => {
    const current = (params.get(key) || '').split(',').filter(Boolean);
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    set({ [key]: next.join(',') });
  };
  const active = ['category', 'medium', 'availability', 'artist', 'minPrice', 'maxPrice', 'search', 'orientation', 'price'].filter((k) => params.get(k));
  const f = facets.data;
  // Reflect a band chosen via a home-page tile (?price=<index>) in the radios.
  const tileBand = bandForPriceParam(params.get('price'));
  const priceMin = params.get('minPrice') ?? tileBand?.min ?? '';
  const priceMax = params.get('maxPrice') ?? tileBand?.max ?? '';
  return (
    <section className="catalog">
      <div className="catalog-title">
        <span className="eyebrow">THE COLLECTION</span>
        <h1>Artworks</h1>
        <p>Singular works, selected for depth, material intelligence, and enduring presence.</p>
      </div>
      <div className="catalog-tools">
        <form className="search" role="search" onSubmit={(e) => (e.preventDefault(), set({ search: search.current.value.trim() }))}>
          <Search aria-hidden="true" />
          <input ref={search} type="search" aria-label="Search artworks" placeholder="Search artist, title, medium…" defaultValue={params.get('search') || ''} key={params.get('search') || ''} />
        </form>
        <button className="filter-button" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="filters">
          <SlidersHorizontal aria-hidden="true" /> Filter{active.length ? ` (${active.length})` : ''}
        </button>
        <select aria-label="Sort artworks" value={params.get('sort') || (params.get('search') ? '' : 'newest')} onChange={(e) => set({ sort: e.target.value })}>
          {params.get('search') && <option value="">Best match</option>}
          <option value="newest">Newest</option>
          <option value="featured">Featured</option>
          <option value="popular">Most viewed</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="year_desc">Year: newest first</option>
        </select>
      </div>
      <div className="catalog-body">
        <aside className={drawer ? 'drawer' : ''} id="filters" aria-label="Filters">
          <button className="drawer-x" onClick={() => setDrawer(false)}>
            <X aria-hidden="true" /> Close
          </button>
          {f &&
            [
              ['category', 'Category', f.categories],
              ['medium', 'Medium', f.mediums],
              ['availability', 'Availability', f.availability],
            ].map(([key, name, items]) => (
              <fieldset key={key}>
                <legend>{name}</legend>
                {items.map((x) => (
                  <label key={x._id}>
                    <input type="checkbox" checked={(params.get(key) || '').split(',').includes(x._id)} onChange={() => toggleList(key, x._id)} />
                    {label(x._id)} <small>({x.count})</small>
                  </label>
                ))}
              </fieldset>
            ))}
          <fieldset>
            <legend>Price</legend>
            {PRICE_BANDS.map(([min, max, text]) => (
              <label key={text}>
                <input type="radio" name="price" checked={priceMin === min && priceMax === max} onChange={() => set({ minPrice: min, maxPrice: max })} />
                {text}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Orientation</legend>
            {['portrait', 'landscape', 'square'].map((o) => (
              <label key={o}>
                <input type="checkbox" checked={(params.get('orientation') || '').split(',').includes(o)} onChange={() => toggleList('orientation', o)} />
                {label(o)}
              </label>
            ))}
          </fieldset>
          {f?.artists?.length > 0 && (
            <fieldset>
              <legend>Artist</legend>
              <ArtistSelect artists={f.artists} value={params.get('artist') || ''} onChange={(v) => set({ artist: v })} />
            </fieldset>
          )}
          <button className="text-link" onClick={() => setParams({})}>
            Clear all filters
          </button>
        </aside>
        <div className="results">
          <div className="results-count" role="status" aria-live="polite">
            <span>{meta ? `${meta.total} work${meta.total === 1 ? '' : 's'}` : ''}</span>
            {meta?.fuzzy && <span>Showing close matches for “{params.get('search')}”</span>}
          </div>
          {query.isLoading ? (
            <Loading />
          ) : query.error ? (
            <ErrorState error={query.error} retry={query.refetch} />
          ) : works.length ? (
            <>
              <div className="art-grid catalog-grid" aria-busy={query.isFetching}>
                {works.map((x, i) => (
                  <ArtworkCard key={x.slug} artwork={x} index={i} />
                ))}
              </div>
              {meta.pages > 1 && (
                <nav className="pagination" aria-label="Pages">
                  <button className="button ghost" disabled={meta.page <= 1} onClick={() => set({ page: String(meta.page - 1) })}>
                    Previous
                  </button>
                  <span>
                    Page {meta.page} of {meta.pages}
                  </span>
                  <button className="button ghost" disabled={!meta.hasMore} onClick={() => set({ page: String(meta.page + 1) })}>
                    Next
                  </button>
                </nav>
              )}
            </>
          ) : (
            <Empty title="No works match these filters" action={<button className="button ghost" onClick={() => setParams({})}>Clear filters</button>} />
          )}
        </div>
      </div>
    </section>
  );
}
