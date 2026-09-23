// Load test for the read-heavy public API. Run against a seeded, non-production API:
//   TARGET=http://localhost:4000 node backend/load/run.mjs
// Rate limits are disabled only when the API runs with NODE_ENV=test, so numbers reflect app + database capacity.
import autocannon from 'autocannon';
import { writeFileSync } from 'node:fs';

const TARGET = process.env.TARGET || 'http://localhost:4000';
const DURATION = Number(process.env.DURATION || 10);
const CONNECTIONS = Number(process.env.CONNECTIONS || 50);
const OUT = process.env.OUT;

const first = await (await fetch(`${TARGET}/api/v1/artworks?limit=1`)).json();
const slug = first.data?.[0]?.slug;
if (!slug) throw new Error(`No artworks at ${TARGET}. Seed the database first.`);

const scenarios = [
  ['Health check', '/health'],
  ['Catalogue page (24 works)', '/api/v1/artworks?limit=24'],
  ['Catalogue, filtered and sorted', '/api/v1/artworks?category=Paintings&sort=price_asc&limit=24'],
  ['Catalogue search', '/api/v1/artworks?q=geometry'],
  ['Facets', '/api/v1/artworks/facets'],
  ['Artwork detail', `/api/v1/artworks/${slug}`],
  ['Artists with counts', '/api/v1/artists'],
  ['Journal list', '/api/v1/articles'],
];

const results = [];
for (const [name, path] of scenarios) {
  const r = await autocannon({ url: TARGET + path, connections: CONNECTIONS, duration: DURATION });
  const row = { name, path, rps: Math.round(r.requests.average), p50: r.latency.p50, p97_5: r.latency.p97_5, p99: r.latency.p99, errors: r.errors + r.timeouts, non2xx: r.non2xx };
  results.push(row);
  console.log(`${name.padEnd(34)} ${String(row.rps).padStart(6)} req/s  p50 ${row.p50}ms  p99 ${row.p99}ms  errors ${row.errors}  non-2xx ${row.non2xx}`);
}
if (OUT) writeFileSync(OUT, JSON.stringify({ target: TARGET, connections: CONNECTIONS, durationSeconds: DURATION, at: new Date().toISOString(), node: process.version, results }, null, 2));
const failed = results.filter((r) => r.errors || r.non2xx || r.p99 > Number(process.env.MAX_P99 || 1000));
if (failed.length) {
  console.error('Budget exceeded:', failed.map((r) => r.name).join(', '));
  process.exit(1);
}
