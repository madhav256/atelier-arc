import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api as request, money } from '../lib/api';
import { horizontalScroll } from '../lib/motion';

// One signature work per corner of the gallery, walked sideways.
const GENRE_WALK = [
  ['Paintings', 'after-the-monsoon'],
  ['Sculptures', 'folded-light'],
  ['Photography', 'salt-pans-first-light'],
  ['Ceramics', 'river-clay-suite'],
  ['Textiles', 'loom-song'],
  ['Prints', 'half-moon-bazaar'],
  ['Works on Paper', 'monsoon-letter'],
  ['Mixed Media', 'bazaar-reliquary'],
  ['Digital Art', 'afterimage'],
];

export function InFocus() {
  const q = useQuery({
    queryKey: ['artworks', 'in-focus'],
    queryFn: () => Promise.all(GENRE_WALK.map(([, slug]) => request('/artworks/' + slug).catch(() => null))),
  });
  const works = (q.data || []).map((w, i) => (w ? { ...w, genre: GENRE_WALK[i][0] } : null)).filter(Boolean);
  const root = useRef(null);
  const track = useRef(null);
  // Layout effect: the pin-spacer must unwrap before React detaches this DOM,
  // or unmounting Home crashes the whole tree (removeChild mismatch).
  useLayoutEffect(() => {
    if (works.length < 3) return undefined;
    return horizontalScroll(root.current, track.current);
  }, [works.length]);
  if (!works.length) return null;
  return (
    <section className="in-focus" ref={root} aria-labelledby="in-focus-title">
      <div className="in-focus-head">
        <span className="eyebrow">
          <i>03</i> Across the gallery
        </span>
        <h2 id="in-focus-title">
          Nine rooms,
          <br />
          <em>one walk.</em>
        </h2>
      </div>
      <div className="in-focus-track" ref={track}>
        {works.map((w, i) => (
          <Link to={`/artworks/${w.slug}`} className="in-focus-card" key={w.slug}>
            <span className="if-index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="if-image">
              <img src={w.images[0].url} alt={w.images[0].alt || `${w.title} by ${w.artist?.name || 'the artist'}`} loading="lazy" />
            </div>
            <span className="if-genre">{w.genre}</span>
            <h3>{w.title}</h3>
            <p>
              {w.artist?.name} · {w.priceOnRequest ? 'Price on request' : money(w.price)}
            </p>
          </Link>
        ))}
        <Link to="/artworks" className="in-focus-card if-cta">
          <span>
            The full
            <br />
            catalogue
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
