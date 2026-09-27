import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ArtworkCard } from '../components/ArtworkCard';
import { AdvisorChat } from '../components/AdvisorChat';
import { HeroCarousel } from '../components/HeroCarousel';
import { InFocus } from '../components/InFocus';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useQuery } from '@tanstack/react-query';
import { api as request } from '../lib/api';
import { kineticize } from '../lib/kinetic';

// Opening set: one statement piece per corner of the gallery.
const HERO_SLUGS = ['night-swimming', 'monsoon-sentinel', 'river-weave', 'sea-face-at-noon', 'ember-jar', 'temple-court'];

function GenreMarquee() {
  const items = ['Paintings', 'Sculptures', 'Photography', 'Ceramics', 'Textiles', 'Prints', 'Works on Paper', 'Mixed Media', 'Digital Art'];
  const set = (k) => (
    <div className="marquee-set" key={k}>
      {items.map((t) => (
        <span key={t}>
          {t}
          <i aria-hidden="true">·</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-hidden="true">
      {set('a')}
      {set('b')}
    </div>
  );
}

export default function Home() {
  const introRef = useRef(null);
  // Kinetic letters on the intro statement (fill <-> gold outline cycle).
  useEffect(() => kineticize(introRef.current), []);
  useDocumentMeta('',  'Discover original contemporary art, private viewings, and collector advisory.');
  const featuredQ = useQuery({ queryKey: ['artworks', 'home-featured'], queryFn: () => request('/artworks?featured=true&limit=8') });
  const heroQ = useQuery({ queryKey: ['artworks', 'home-hero'], queryFn: () => Promise.all(HERO_SLUGS.map((s) => request('/artworks/' + s).catch(() => null))) });
  const curated = (heroQ.data || []).filter(Boolean);
  const heroWorks = curated.length ? curated : featuredQ.data || [];
  const trendingQ = useQuery({ queryKey: ['artworks', 'trending'], queryFn: () => request('/artworks/trending?limit=4') });
  const featured = featuredQ.data || [];
  const artistsQ = useQuery({ queryKey: ['artists', 'featured'], queryFn: () => request('/artists?featured=true') });
  const storiesQ = useQuery({ queryKey: ['articles', 'home'], queryFn: () => request('/articles?limit=2') });
  const spot = artistsQ.data?.[0];
  const stories = storiesQ.data || [];
  const hero = heroWorks[0];
  return (
    <>
      {heroQ.data && hero ? <HeroCarousel works={heroWorks} /> : <section className="hero hero-loading" aria-busy="true" aria-label="Loading featured work" />}
      <section className="intro">
        <span className="eyebrow">
          <i>01</i> Curated with intention
        </span>
        <h2 ref={introRef}>
          Exceptional art.
          <br />
          <em>Considered living.</em>
        </h2>
        <p>We bring together singular works by established masters and defining voices of a new generation. Each piece is chosen for what it holds, and how it transforms a space.</p>
      </section>
      <GenreMarquee />
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              <i>02</i> New acquisitions
            </span>
            <h2>Recently arrived</h2>
          </div>
          <Link className="text-link" to="/artworks">
            View all works <ArrowRight />
          </Link>
        </div>
        <div className="art-grid art-grid-editorial">{(trendingQ.data || featured.slice(0, 4)).map((x, i) => <ArtworkCard artwork={x} index={i} key={x.slug} />)}</div>
      </section>
      <InFocus />
      <PriceStory />
      {spot && (
        <section className="spotlight section">
          <div className="spotlight-image">
            <img src={spot.portrait} alt={`Portrait of ${spot.name}`} loading="lazy" />
          </div>
          <div>
            <span className="eyebrow">
              <i>05</i> Artist spotlight
            </span>
            <h2>{spot.name}</h2>
            {spot.statement && <p className="dek">"{spot.statement}"</p>}
            <p>{spot.biography}</p>
            <Link className="text-link" to={`/artists/${spot.slug}`}>
              Explore the artist <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}
      {stories.length > 0 && (
        <section className="editorial section">
          <span className="eyebrow">
            <i>06</i> From the journal
          </span>
          <div className="editorial-grid">
            {stories.map((st) => (
              <article key={st._id}>
                <Link to={`/journal/${st.slug}`}>
                  <img src={st.coverImage} alt="" loading="lazy" />
                  <span>
                    {String(st.type || '').toUpperCase()} · {st.readingTime} MIN READ
                  </span>
                  <h3>{st.title}</h3>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="advisor-cta">
        <span className="eyebrow">
          <i>07</i> Private collector services
        </span>
        <h2>
          A more personal
          <br />
          way to collect.
        </h2>
        <p>From finding one defining work to shaping an entire collection, our advisors offer discreet, informed guidance.</p>
        <div className="cta-actions">
          <Link className="button light" to="/advisory">
            Speak with an art advisor
          </Link>
          <AdvisorChat className="text-link advisor-chat">Or email us</AdvisorChat>
        </div>
      </section>
    </>
  );
}

function PriceStory() {
  const tiers = [
    ['Under ₹50,000', 'Discover'],
    ['₹50,000 – ₹1L', 'Begin'],
    ['₹1L – ₹5L', 'Collect'],
    ['₹5L – ₹10L', 'Invest'],
    ['₹10L+', 'Acquire'],
  ];
  return (
    <section className="price-story">
      <div>
        <span className="eyebrow">
          <i>04</i> Browse by price
        </span>
        <h2>
          Find the work
          <br />
          that speaks to you.
        </h2>
        <p>A collection has no correct beginning. Start with a feeling, a room, or a considered range.</p>
      </div>
      <div className="price-list">
        {tiers.map(([t, k], i) => (
          <Link to={`/artworks?price=${i}`} key={t}>
            <i className="rule" aria-hidden="true" />
            <b>0{i + 1}</b>
            <span>
              {t}
              <small>{k}</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
