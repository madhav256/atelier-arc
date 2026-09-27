import { useEffect, useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api, label } from '../lib/api';
import { applyPriceParam, bandForPriceParam } from '../lib/priceBands';
import { ArtworkCard } from '../components/ArtworkCard';
import { Loading, ErrorState, Empty } from '../components/States';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { kineticize } from '../lib/kinetic';

// Filter option names arrive lowercase from the API; the panel shows them capitalized.
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Same ranges as the "Browse by price" tiles on the home page.
const SORT_OPTIONS = [
  { _id: 'newest', name: 'Newest' },
  { _id: 'featured', name: 'Featured' },
  { _id: 'popular', name: 'Most viewed' },
  { _id: 'price_asc', name: 'Price: low to high' },
  { _id: 'price_desc', name: 'Price: high to low' },
  { _id: 'year_desc', name: 'Year: newest first' },
];

const PRICE_BANDS = [
  ['', '', 'Any price'],
  ['', '50000', 'Under ₹50,000'],
  ['50000', '100000', '₹50,000 – ₹1L'],
  ['100000', '500000', '₹1L – ₹5L'],
  ['500000', '1000000', '₹5L – ₹10L'],
  ['1000000', '', '₹10L+'],
];

// Themed replacement for a native <select> (artist filter, toolbar sort): same
// look closed, and an on-theme open state instead of the OS picker. Follows the
// APG collapsible-listbox pattern (focus stays on the button, aria-activedescendant
// tracks the highlighted option). overlay floats the panel over the page (toolbar
// sort); the default opens in-flow (the filters drawer clips overlays).
function ThemedSelect({ options, value, onChange, ariaLabel, overlay = false }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);
  const uid = useId();
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
    if (open) document.getElementById(`${uid}-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  // The mobile filters drawer is its own scroll container, so a list that
  // opens near the drawer bottom renders mostly off-screen. Glide the drawer
  // until the open list sits near the top; no-op on desktop (no overflow).
  useEffect(() => {
    if (!open) return;
    const aside = box.current?.closest('aside');
    const list = box.current?.querySelector('ul');
    if (!aside || !list) return;
    const top = aside.scrollTop + list.getBoundingClientRect().top - aside.getBoundingClientRect().top - 12;
    aside.scrollTo({ top, behavior: 'smooth' });
  }, [open]);

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
        aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {options[selected].name}
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <ul role="listbox" aria-label={ariaLabel} className={overlay ? 'overlay' : undefined}>
          {options.map((o, i) => (
            <li
              key={o._id || 'all'}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={i === selected}
              className={i === active ? 'active' : ''}
              onClick={() => choose(i)}
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
  const [searchOpen, setSearchOpen] = useState(false);
  const search = useRef(null);
  const titleRef = useRef(null);
  const apiParams = applyPriceParam(params);
  apiParams.delete('focus');
  if (!apiParams.get('limit')) apiParams.set('limit', '24');
  const query = useQuery({ queryKey: ['artworks', apiParams.toString()], queryFn: () => api(`/artworks?${apiParams}`, { raw: true }), placeholderData: keepPreviousData });
  const facets = useQuery({ queryKey: ['facets'], queryFn: () => api('/artworks/facets'), staleTime: 5 * 60_000 });
  // Split the display heading into kinetic letters (fill <-> gold outline cycle).
  useEffect(() => kineticize(titleRef.current), []);
  useEffect(() => {
    if (params.get('focus') === 'search') {
      setSearchOpen(true);
      search.current?.focus();
    }
  }, [params]);
  // Tap anywhere outside the open filters drawer (the scrim) or press Escape to close it.
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawer(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawer]);
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
        <h1 ref={titleRef}>Artworks</h1>
        <p>Singular works, selected for depth, material intelligence, and enduring presence.</p>
      </div>
      <div className={`catalog-tools${searchOpen ? ' search-open' : ''}`}>
        <form className="search" role="search" onSubmit={(e) => (e.preventDefault(), set({ search: search.current.value.trim() }), setSearchOpen(false))}>
          <Search aria-hidden="true" />
          <input ref={search} type="search" aria-label="Search artworks" placeholder="Search artist, title, medium…" defaultValue={params.get('search') || ''} key={params.get('search') || ''} />
        </form>
        <button type="button" className="search-toggle" aria-label="Search artworks" aria-expanded={searchOpen} onClick={() => { setSearchOpen(true); requestAnimationFrame(() => search.current?.focus()); }}>
          <Search aria-hidden="true" />
        </button>
        <button className="filter-button" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="filters">
          <SlidersHorizontal aria-hidden="true" /> Filter{active.length ? ` (${active.length})` : ''}
        </button>
        <ThemedSelect
          options={params.get('search') ? [{ _id: '', name: 'Best match' }, ...SORT_OPTIONS] : SORT_OPTIONS}
          value={params.get('sort') || (params.get('search') ? '' : 'newest')}
          onChange={(v) => set({ sort: v })}
          ariaLabel="Sort artworks"
          overlay
        />
      </div>
      <div className="catalog-body">
        {drawer && <button type="button" className="drawer-scrim" aria-label="Close filters" onClick={() => setDrawer(false)} />}
        <aside className={drawer ? 'drawer' : ''} id="filters" aria-label="Filters" data-lenis-prevent>
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
                    {cap(label(x._id))} <small>({x.count})</small>
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
                {cap(label(o))}
              </label>
            ))}
          </fieldset>
          {f?.artists?.length > 0 && (
            <fieldset>
              <legend>Artist</legend>
              <ThemedSelect options={[{ _id: '', name: 'All artists' }, ...f.artists]} value={params.get('artist') || ''} onChange={(v) => set({ artist: v })} ariaLabel="Artist" />
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
