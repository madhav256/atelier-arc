import { useEffect } from 'react';

const SITE = 'Atelier Arc';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) return el?.remove();
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.setAttribute('content', content);
}

// Title, description, canonical, Open Graph / Twitter cards, robots and optional JSON-LD per page.
export function useDocumentMeta(title, description, { image, type = 'website', jsonLd, noindex } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : SITE;
    document.title = full;
    const url = location.origin + location.pathname;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:site_name', SITE);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = url;
    let script = document.getElementById('page-jsonld');
    if (ld) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'page-jsonld';
        document.head.append(script);
      }
      script.textContent = ld;
    } else script?.remove();
  }, [title, description, image, type, ld, noindex]);
}
