import { Artwork, Artist, Article, Collection } from '../models/index.js';
import { env } from '../config/env.js';

// Root-relative asset paths (storefront /art/...) become absolute for crawlers.
const abs = (u) => (u && u.startsWith('/') ? `${env.publicSiteUrl.replace(/\/$/, '')}${u}` : u);
const esc = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

export async function sitemap() {
  const base = env.publicSiteUrl.replace(/\/$/, '');
  const [artworks, artists, articles, collections] = await Promise.all([
    Artwork.find({ published: true }).select('slug updatedAt images').lean(),
    Artist.find({ published: true }).select('slug updatedAt').lean(),
    Article.find({ published: true }).select('slug updatedAt').lean(),
    Collection.find({ published: true }).select('slug updatedAt').lean(),
  ]);
  const staticPages = ['/', '/artworks', '/artists', '/collections', '/journal', '/advisory', '/about', '/contact'].map((p) => ({ loc: p, priority: p === '/' ? '1.0' : '0.8' }));
  const urls = [
    ...staticPages.map((p) => ({ ...p, changefreq: 'weekly' })),
    ...artworks.map((a) => ({ loc: `/artworks/${a.slug}`, lastmod: a.updatedAt, priority: '0.9', image: abs(a.images?.[0]?.url) })),
    ...artists.map((a) => ({ loc: `/artists/${a.slug}`, lastmod: a.updatedAt, priority: '0.7' })),
    ...collections.map((c) => ({ loc: `/collections/${c.slug}`, lastmod: c.updatedAt, priority: '0.6' })),
    ...articles.map((a) => ({ loc: `/journal/${a.slug}`, lastmod: a.updatedAt, priority: '0.6' })),
  ];
  const body = urls
    .map(
      (u) =>
        `<url><loc>${esc(base + u.loc)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}<priority>${u.priority}</priority>${u.image ? `<image:image><image:loc>${esc(u.image)}</image:loc></image:image>` : ''}</url>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`;
}

// schema.org VisualArtwork + Product/Offer for an artwork page.
export function artworkJsonLd(artwork) {
  const url = `${env.publicSiteUrl}/artworks/${artwork.slug}`;
  const offer = artwork.priceOnRequest || artwork.price == null
    ? undefined
    : { '@type': 'Offer', price: artwork.price, priceCurrency: artwork.currency || 'INR', availability: artwork.availability === 'available' ? 'https://schema.org/InStock' : artwork.availability === 'reserved' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/SoldOut', url };
  return {
    '@context': 'https://schema.org',
    '@type': ['VisualArtwork', 'Product'],
    name: artwork.title,
    url,
    image: artwork.images?.map((i) => abs(i.url)),
    description: artwork.description,
    creator: artwork.artist?.name ? { '@type': 'Person', name: artwork.artist.name, url: `${env.publicSiteUrl}/artists/${artwork.artist.slug}` } : undefined,
    artMedium: artwork.medium,
    artform: artwork.category,
    dateCreated: artwork.year ? String(artwork.year) : undefined,
    width: artwork.dimensions?.width ? { '@type': 'Distance', name: `${artwork.dimensions.width} ${artwork.dimensions.unit}` } : undefined,
    height: artwork.dimensions?.height ? { '@type': 'Distance', name: `${artwork.dimensions.height} ${artwork.dimensions.unit}` } : undefined,
    brand: { '@type': 'Organization', name: 'Atelier Arc' },
    offers: offer,
  };
}
