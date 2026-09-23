import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArtworkCard } from '../components/ArtworkCard';
import { api } from '../lib/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useSession } from '../hooks/useSession';
import { Loading, ErrorState } from '../components/States';

export default function ArtistDetail() {
  const { slug } = useParams();
  const qc = useQueryClient();
  const { user } = useSession();
  const q = useQuery({ queryKey: ['artist', slug], queryFn: () => api(`/artists/${slug}`) });
  const profile = useQuery({ queryKey: ['me', 'profile'], queryFn: () => api('/me/profile'), enabled: Boolean(user) });
  const a = q.data;
  const following = profile.data?.followedArtists?.some((f) => f._id === a?._id);
  const follow = useMutation({
    mutationFn: () => api(`/me/following/${a._id}`, { method: following ? 'DELETE' : 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me', 'profile'] }),
  });
  useDocumentMeta(a?.name || 'Artist', a?.biography?.slice(0, 160), {
    image: a?.portrait,
    type: 'profile',
    jsonLd: a && { '@context': 'https://schema.org', '@type': 'Person', name: a.name, nationality: a.nationality, homeLocation: a.location, image: a.portrait, description: a.biography },
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const available = a.artworks.filter((w) => w.availability !== 'sold');
  const sold = a.artworks.filter((w) => w.availability === 'sold');
  return (
    <>
      <section className="artist-hero">
        <img src={a.portrait} alt={`Portrait of ${a.name}`} />
        <div>
          <span className="eyebrow">
            ARTIST{a.location ? ` · ${a.location.toUpperCase()}` : ''}
            {a.nationality ? `, ${a.nationality.toUpperCase()}` : ''}
          </span>
          <h1>{a.name}</h1>
          <p className="dek">{a.biography}</p>
          <dl>
            {a.birthYear && (
              <div>
                <dt>Born</dt>
                <dd>{a.birthYear}</dd>
              </div>
            )}
            {a.movement && (
              <div>
                <dt>Practice</dt>
                <dd>{a.movement}</dd>
              </div>
            )}
          </dl>
          {user ? (
            <button className="button ghost" onClick={() => follow.mutate()} aria-pressed={Boolean(following)} disabled={follow.isPending}>
              {following ? 'Following' : 'Follow for new works'}
            </button>
          ) : (
            <Link className="button ghost" to={`/login?next=/artists/${a.slug}`}>
              Sign in to follow
            </Link>
          )}
        </div>
      </section>
      {a.statement && (
        <section className="section">
          <span className="eyebrow">ARTIST STATEMENT</span>
          <p className="dek">{a.statement}</p>
        </section>
      )}
      {a.timeline?.length > 0 && (
        <section className="timeline section">
          <span className="eyebrow">SELECTED TIMELINE</span>
          {[...a.timeline].sort((x, y) => x.year - y.year).map((t) => (
            <div key={`${t.year}-${t.title}`}>
              <b>{t.year}</b>
              <p>
                {t.title}
                {t.description ? ` — ${t.description}` : ''}
              </p>
            </div>
          ))}
        </section>
      )}
      <section className="section">
        <div className="section-head">
          <h2>Available works</h2>
        </div>
        {available.length ? (
          <div className="art-grid">
            {available.map((x, i) => (
              <ArtworkCard key={x.slug} artwork={x} index={i} />
            ))}
          </div>
        ) : (
          <p>No works are available right now. Follow the artist to hear about new works first.</p>
        )}
      </section>
      {sold.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Previously placed</h2>
          </div>
          <div className="art-grid">
            {sold.map((x, i) => (
              <ArtworkCard key={x.slug} artwork={x} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
