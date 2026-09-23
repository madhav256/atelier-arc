import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Loading, ErrorState, Empty } from '../components/States';
import { ArtworkCard } from '../components/ArtworkCard';

export default function Collections() {
  useDocumentMeta('Collections', 'Curated collections from Atelier Arc.');
  const q = useQuery({ queryKey: ['curated'], queryFn: () => api('/collections') });
  return (
    <section className="plain-page">
      <span className="eyebrow">CURATED BY ATELIER ARC</span>
      <h1>Collections</h1>
      <p className="lede">A series of considered dialogues between material, gesture, and contemporary life.</p>
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : (
        <div className="collection-grid">
          {q.data.map((c, i) => (
            <Link to={`/collections/${c.slug}`} key={c._id} className="collection-tile">
              <div style={{ backgroundImage: c.coverImage ? `url(${c.coverImage})` : undefined }} role="presentation" />
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h2>{c.name}</h2>
              <p>{c.description || 'Explore the collection'}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function CollectionDetail() {
  const { slug } = useParams();
  const q = useQuery({ queryKey: ['curated', slug], queryFn: () => api(`/collections/${slug}`) });
  const c = q.data;
  useDocumentMeta(c?.name || 'Collection', c?.description, {
    image: c?.coverImage,
    jsonLd: c && { '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.name, description: c.description, hasPart: c.artworks.map((a) => ({ '@type': 'VisualArtwork', name: a.title })) },
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  return (
    <section className="plain-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/collections">Collections</Link> / <span aria-current="page">{c.name}</span>
      </nav>
      <span className="eyebrow">COLLECTION · {c.artworks.length} WORKS</span>
      <h1>{c.name}</h1>
      {c.description && <p className="lede">{c.description}</p>}
      {c.artworks.length ? (
        <div className="art-grid">
          {c.artworks.map((a, i) => (
            <ArtworkCard key={a.slug} artwork={a} index={i} />
          ))}
        </div>
      ) : (
        <Empty title="This collection is being hung" text="New works are added here soon." action={<Link className="button ghost" to="/artworks">Browse all works</Link>} />
      )}
    </section>
  );
}
