import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, date } from '../lib/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Loading, ErrorState } from '../components/States';
import { ArtworkCard } from '../components/ArtworkCard';

export default function Journal() {
  useDocumentMeta('Journal', 'Artist stories, collector guides and exhibition reviews.');
  const q = useQuery({ queryKey: ['articles'], queryFn: () => api('/articles?limit=24') });
  return (
    <section className="plain-page">
      <span className="eyebrow">THE JOURNAL</span>
      <h1>
        Ideas for a<br />
        <em>considered collection.</em>
      </h1>
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : (
        <div className="journal-grid">
          {q.data.map((s) => (
            <Link to={`/journal/${s.slug}`} key={s._id}>
              <img src={s.coverImage} alt="" loading="lazy" width="1200" height="800" />
              <span>
                {s.type?.toUpperCase()} · {s.readingTime} MIN
              </span>
              <h2>{s.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// Minimal, safe markdown: headings and paragraphs rendered as React text (no HTML injection).
function Body({ content = '' }) {
  return content
    .split(/\n{2,}/)
    .map((block, i) => (block.startsWith('## ') ? <h2 key={i}>{block.slice(3)}</h2> : block.startsWith('### ') ? <h3 key={i}>{block.slice(4)}</h3> : <p key={i}>{block}</p>));
}

export function JournalStory() {
  const { slug } = useParams();
  const q = useQuery({ queryKey: ['article', slug], queryFn: () => api(`/articles/${slug}`) });
  const s = q.data;
  useDocumentMeta(s?.title || 'Journal', s?.subtitle, {
    image: s?.coverImage,
    type: 'article',
    jsonLd: s && { '@context': 'https://schema.org', '@type': 'Article', headline: s.title, description: s.subtitle, image: s.coverImage, author: { '@type': 'Organization', name: s.author }, datePublished: s.publishedAt },
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  return (
    <article className="plain-page story">
      <span className="eyebrow">
        {s.type?.toUpperCase()} · {s.readingTime} MIN READ
      </span>
      <h1>{s.title}</h1>
      <p className="dek">{s.subtitle}</p>
      <p className="muted">
        {s.author} · <time dateTime={s.publishedAt}>{date(s.publishedAt, { dateStyle: 'long' })}</time>
      </p>
      <img src={s.coverImage} alt="" width="1600" height="900" />
      <div className="story-body">
        <Body content={s.content} />
      </div>
      {s.relatedArtworks?.length > 0 && (
        <section className="section">
          <h2>Works in this story</h2>
          <div className="art-grid">
            {s.relatedArtworks.map((x, i) => (
              <ArtworkCard key={x.slug} artwork={x} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
