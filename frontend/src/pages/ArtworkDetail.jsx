import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Heart, Maximize2, ShieldCheck, Truck, Bell } from 'lucide-react';
import { useRef, useState } from 'react';
import { api, money, label } from '../lib/api';
import { ArtworkCard } from '../components/ArtworkCard';
import { InquiryForm } from '../components/InquiryForm';
import { Loading, ErrorState } from '../components/States';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useCart } from '../hooks/useCart';
import { useCollection } from '../hooks/useCollection';
import { useSession } from '../hooks/useSession';

export default function ArtworkDetail() {
  const { slug } = useParams();
  const query = useQuery({ queryKey: ['artwork', slug], queryFn: () => api(`/artworks/${slug}`), retry: 1 });
  const a = query.data;
  useDocumentMeta(a ? `${a.title} by ${a.artist?.name}` : 'Artwork', a?.description?.slice(0, 160), { image: a?.images?.[0]?.url, type: 'product', jsonLd: a?.jsonLd });
  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorState error={query.error} retry={query.refetch} />;
  return <Detail artwork={a} />;
}

function Detail({ artwork: a }) {
  const { add, cart } = useCart();
  const { isSaved, toggle } = useCollection();
  const { user } = useSession();
  const [room, setRoom] = useState(false);
  const [added, setAdded] = useState(false);
  const dialog = useRef(null);
  const fullscreen = useRef(null);
  const alert = useMutation({ mutationFn: () => api('/me/alerts', { body: { artworkId: a._id } }) });
  const inBag = cart.lines.some((l) => String(l.artworkId) === String(a._id));
  const purchasable = !a.priceOnRequest && a.price != null && a.availability === 'available';
  const saved = isSaved(a);
  return (
    <>
      <section className="detail">
        <div className="detail-gallery">
          <Link to="/artworks" className="back">
            <ArrowLeft aria-hidden="true" /> All artworks
          </Link>
          <button className="zoom" onClick={() => fullscreen.current?.showModal()}>
            <Maximize2 aria-hidden="true" /> View fullscreen
          </button>
          <img src={a.images?.[0]?.url} alt={a.images?.[0]?.alt || a.title} fetchpriority="high" />
        </div>
        <div className="detail-info">
          <span className="eyebrow">{a.category || 'ORIGINAL WORK'}</span>
          <h1>{a.title}</h1>
          <Link to={`/artists/${a.artist?.slug}`} className="artist-name">
            {a.artist?.name}
          </Link>
          <dl>
            <div>
              <dt>Year</dt>
              <dd>{a.year}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>{a.medium}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>
                {a.dimensions?.width} × {a.dimensions?.height}
                {a.dimensions?.depth ? ` × ${a.dimensions.depth}` : ''} {a.dimensions?.unit}
              </dd>
            </div>
            {a.edition && (
              <div>
                <dt>Edition</dt>
                <dd>{a.edition}</dd>
              </div>
            )}
            <div>
              <dt>Availability</dt>
              <dd className={a.availability}>{label(a.availability)}</dd>
            </div>
          </dl>
          <p className="detail-price">{a.priceOnRequest ? 'Price on request' : money(a.price, a.currency)}</p>
          {purchasable ? (
            inBag || added ? (
              <Link className="button" to="/cart">
                In your bag · Review
              </Link>
            ) : (
              <button className="button" onClick={() => add.mutate(a._id, { onSuccess: () => setAdded(true) })} disabled={add.isPending}>
                {add.isPending ? 'Adding…' : 'Add to acquisition bag'}
              </button>
            )
          ) : (
            <button className="button" onClick={() => dialog.current?.showModal()}>
              {a.availability === 'sold' ? 'Ask about similar works' : a.priceOnRequest ? 'Request price' : 'Inquire'}
            </button>
          )}
          {add.error && (
            <p className="form-error" role="alert">
              {add.error.message}
            </p>
          )}
          <button className="button ghost" onClick={() => toggle.mutate(a)} aria-pressed={saved}>
            <Heart aria-hidden="true" fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved to My Collection' : 'Add to My Collection'}
          </button>
          {a.availability !== 'available' && user && (
            <button className="text-link" onClick={() => alert.mutate()} disabled={alert.isSuccess}>
              <Bell aria-hidden="true" /> {alert.isSuccess ? 'We will tell you if it becomes available' : 'Notify me if this becomes available'}
            </button>
          )}
          {purchasable && (
            <button className="text-link" onClick={() => dialog.current?.showModal()}>
              Speak with an advisor
            </button>
          )}
          <button className="text-link room-link" onClick={() => setRoom(!room)} aria-expanded={room}>
            View in your space <Maximize2 aria-hidden="true" />
          </button>
          <div className="assurances">
            <p>
              <ShieldCheck aria-hidden="true" /> {a.certificate || 'Certificate of authenticity'}
            </p>
            <p>
              <Truck aria-hidden="true" /> Insured specialist delivery
            </p>
          </div>
        </div>
      </section>
      {room && <RoomViewer artwork={a} />}
      <section className="detail-story">
        <div>
          <span className="eyebrow">ABOUT THE WORK</span>
          <p className="dek">{a.description}</p>
        </div>
        <div>
          <details open>
            <summary>Provenance</summary>
            <p>{a.provenance?.join(' · ') || 'Direct from the artist studio'}</p>
          </details>
          {a.exhibitionHistory?.length > 0 && (
            <details>
              <summary>Exhibition history</summary>
              <p>{a.exhibitionHistory.join(' · ')}</p>
            </details>
          )}
          <details>
            <summary>Condition and certificate</summary>
            <p>
              {a.condition || 'Excellent'}. {a.certificate || 'Certificate included'}.
            </p>
          </details>
          <details>
            <summary>Shipping</summary>
            <p>{a.shipping || 'Specialist insured delivery is arranged after acquisition.'}</p>
          </details>
        </div>
      </section>
      {a.similar?.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">A CONSIDERED PAIRING</span>
              <h2>Similar works</h2>
            </div>
          </div>
          <div className="art-grid">
            {a.similar.slice(0, 4).map((x, i) => (
              <ArtworkCard key={x.slug} artwork={x} index={i} />
            ))}
          </div>
        </section>
      )}
      <dialog ref={dialog} aria-labelledby="inquiry-title">
        <button onClick={() => dialog.current.close()} aria-label="Close">
          ×
        </button>
        <span className="eyebrow">PRIVATE INQUIRY</span>
        <h2 id="inquiry-title">{a.title}</h2>
        <p>Our advisory team will respond within one business day.</p>
        <InquiryForm artwork={a} />
      </dialog>
      <dialog ref={fullscreen} className="fullscreen" aria-label={`${a.title}, full screen`}>
        <button onClick={() => fullscreen.current.close()} aria-label="Close full screen">
          ×
        </button>
        <img src={a.images?.[0]?.url} alt={a.images?.[0]?.alt || a.title} />
      </dialog>
    </>
  );
}

// Scale simulation using the work's real dimensions against a 300 cm wide wall.
function RoomViewer({ artwork }) {
  const [wall, setWall] = useState('stone');
  const [wallWidth, setWallWidth] = useState(300);
  const w = artwork.dimensions?.unit === 'in' ? artwork.dimensions.width * 2.54 : artwork.dimensions?.width || 80;
  const pct = Math.min(90, Math.max(8, (w / wallWidth) * 100));
  return (
    <section className={`room-view ${wall}`} aria-label="Room simulation">
      <div className="room-control">
        <span className="eyebrow">VIEW IN YOUR SPACE · SIMULATION</span>
        <h2>Place the work</h2>
        <label>
          Wall width: {wallWidth} cm
          <input type="range" min="150" max="600" step="10" value={wallWidth} onChange={(e) => setWallWidth(Number(e.target.value))} />
        </label>
        <div role="group" aria-label="Wall colour">
          {['stone', 'warm', 'charcoal'].map((x) => (
            <button key={x} onClick={() => setWall(x)} aria-pressed={wall === x}>
              {x === 'warm' ? 'Warm ivory' : x[0].toUpperCase() + x.slice(1)}
            </button>
          ))}
        </div>
        <p>
          Shown at true scale for a {wallWidth} cm wall ({Math.round(w)} cm wide work). Confirm measurements with an advisor before acquisition.
        </p>
      </div>
      <div className="room">
        <img src={artwork.images?.[0]?.url} alt={`${artwork.title} simulated on a wall`} style={{ width: `${pct}%` }} />
        <div className="console" />
        <div className="sofa" />
      </div>
    </section>
  );
}
