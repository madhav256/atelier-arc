import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { money, label } from '../lib/api';
import { useCollection } from '../hooks/useCollection';

export function ArtworkCard({ artwork, index = 0 }) {
  const { isSaved, toggle } = useCollection();
  const saved = isSaved(artwork);
  const image = artwork.images?.[0];
  const webp = image?.variants?.filter((v) => v.format === 'webp');
  return (
    <article className="art-card reveal" style={{ '--delay': `${index * 60}ms` }}>
      <div className="art-image">
        <Link to={`/artworks/${artwork.slug}`} aria-label={`${artwork.title} by ${artwork.artist?.name || 'the artist'}`}>
          <picture>
            {webp?.length > 0 && <source type="image/webp" srcSet={webp.map((v) => `${v.url} ${v.width}w`).join(', ')} sizes="(max-width: 768px) 100vw, 33vw" />}
            <img src={image?.url} alt={image?.alt || artwork.title} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" width="900" height="1100" />
          </picture>
        </Link>
        <button className={saved ? 'saved' : ''} onClick={() => toggle.mutate(artwork)} aria-pressed={saved} aria-label={saved ? `Remove ${artwork.title} from My Collection` : `Save ${artwork.title} to My Collection`}>
          <Heart fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
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
    </article>
  );
}
