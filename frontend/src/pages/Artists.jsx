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
      <span className="eyebrow">THE ARTISTS · {q.data ? String(q.data.length).padStart(2, '0') : ''}</span>
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
        <ol className="artist-index">
          {q.data.map((a, i) => (
            <li key={a._id}>
              <Link to={`/artists/${a.slug}`}>
                <span className="artist-index-no">{String(i + 1).padStart(2, '0')}</span>
                <img src={a.portrait} alt="" loading="lazy" width="160" height="200" />
                <h2>{a.name}</h2>
                <span className="artist-index-meta">{[a.location, a.movement].filter(Boolean).join(' · ')}</span>
                <span className="artist-index-count">
                  {a.available} of {a.works} available
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
