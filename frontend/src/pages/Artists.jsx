import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Loading, ErrorState } from '../components/States';

export default function Artists() {
  useDocumentMeta('Artists', 'The artists represented by Atelier Arc.');
  const q = useQuery({ queryKey: ['artists'], queryFn: () => api('/artists') });
  return (
    <section className="plain-page">
      <span className="eyebrow">THE ARTISTS</span>
      <h1>
        Distinct voices.
        <br />
        <em>Enduring practices.</em>
      </h1>
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : (
        <div className="artist-grid">
          {q.data.map((a) => (
            <Link to={`/artists/${a.slug}`} key={a._id}>
              <img src={a.portrait} alt="" loading="lazy" width="800" height="1000" />
              <h2>{a.name}</h2>
              <p>
                {[a.location, a.movement].filter(Boolean).join(' · ')}
                <br />
                <small>
                  {a.available} of {a.works} works available
                </small>
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
