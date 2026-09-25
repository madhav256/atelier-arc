import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import { money, label } from '../lib/api';
import { reducedMotion } from '../lib/motion';
import { useCollection } from '../hooks/useCollection';

// Gallery card with spring physics: the card lifts a few pixels and the image
// breathes in on hover; the save heart pops. All motion is inert under
// prefers-reduced-motion.
export function ArtworkCard({ artwork, index = 0 }) {
  const { isSaved, toggle } = useCollection();
  const saved = isSaved(artwork);
  const image = artwork.images?.[0];
  const webp = image?.variants?.filter((v) => v.format === 'webp');
  const still = reducedMotion();
  const [hovered, setHovered] = useState(false);
  const lift = useSpring({ y: hovered && !still ? -6 : 0, config: { tension: 180, friction: 24 } });
  const zoom = useSpring({ scale: hovered && !still ? 1.05 : 1, config: { tension: 110, friction: 26 } });
  const [pop, setPop] = useState(false);
  const heart = useSpring({ scale: pop ? 1.4 : 1, config: { tension: 420, friction: 12 }, onRest: () => setPop(false) });
  const save = () => {
    toggle.mutate(artwork);
    if (!still) setPop(true);
  };
  return (
    <animated.article
      className="art-card reveal"
      style={{ '--delay': `${index * 60}ms`, y: lift.y }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="art-image">
        <Link to={`/artworks/${artwork.slug}`} aria-label={`${artwork.title} by ${artwork.artist?.name || 'the artist'}`}>
          <animated.div className="art-zoom" style={{ scale: zoom.scale }}>
            <picture>
              {webp?.length > 0 && <source type="image/webp" srcSet={webp.map((v) => `${v.url} ${v.width}w`).join(', ')} sizes="(max-width: 768px) 100vw, 33vw" />}
              <img src={image?.url} alt={image?.alt || artwork.title} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" width="900" height="1100" />
            </picture>
          </animated.div>
        </Link>
        <animated.button className={saved ? 'saved' : ''} onClick={save} style={{ scale: heart.scale }} aria-pressed={saved} aria-label={saved ? `Remove ${artwork.title} from My Collection` : `Save ${artwork.title} to My Collection`}>
          <Heart fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </animated.button>
        {artwork.availability && artwork.availability !== 'available' && <span>{label(artwork.availability)}</span>}
      </div>
      <div className="art-meta">
        <div>
          <Link to={`/artworks/${artwork.slug}`}>
            <h3>{artwork.title}</h3>
          </Link>
          <p>
            {artwork.artist?.name}
            {artwork.year ? ` · ${artwork.year}` : ''}
          </p>
        </div>
        <div>
          <p>{artwork.priceOnRequest ? 'Price on request' : money(artwork.price, artwork.currency)}</p>
        </div>
      </div>
    </animated.article>
  );
}
