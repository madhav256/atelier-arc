# Load test

The read-heavy public API (catalogue, facets, artwork detail, artists, journal) was load-tested with [autocannon](https://github.com/mcollina/autocannon) using `backend/load/run.mjs`. Raw numbers are in [`load-test-results.json`](./load-test-results.json).

## How to run

```bash
# 1. MongoDB replica set + seed (see README "Local setup")
cd backend && node src/db/seed.js
# 2. API with rate limits raised so they do not cap the run. Never do this in production.
NODE_ENV=test RATE_LIMIT_TEST_CEILING=100000000 JOBS_ENABLED=false node src/server.js
# 3. From the repo root
TARGET=http://localhost:4000 DURATION=12 CONNECTIONS=25 OUT=docs/load-test-results.json npm run test:load
```

`run.mjs` exits non-zero if any scenario has socket errors, non-2xx responses, or a p99 above `MAX_P99` (default 1000 ms), so it can be used as a regression gate.

## Environment

- API and MongoDB 7.0 (single-node replica set) on the **same** 2 vCPU Intel Xeon 2.6 GHz sandbox with ~2 GB RAM, Node 22.
- Seed data: 15 artists, 50 artworks, 8 collections, 10 articles.
- 25 concurrent connections, 12 seconds per scenario, keep-alive, no CDN or HTTP cache in front.

This is a small shared machine with the load generator competing for the same two cores, so treat the numbers as a floor, not a capacity plan.

## Results (Sept 23, 2026)

| Scenario | Path | Req/s | p50 | p99 | Errors | Non-2xx |
|---|---|---:|---:|---:|---:|---:|
| Health check | `/health` | 3,380 | 6 ms | 29 ms | 0 | 0 |
| Catalogue page (24 works) | `/api/v1/artworks?limit=24` | 242 | 99 ms | 175 ms | 0 | 0 |
| Catalogue, filtered and sorted | `/api/v1/artworks?category=Paintings&sort=price_asc&limit=24` | 369 | 64 ms | 122 ms | 0 | 0 |
| Catalogue search | `/api/v1/artworks?search=geometry` | 438 | 55 ms | 89 ms | 0 | 0 |
| Facets | `/api/v1/artworks/facets` | 396 | 60 ms | 105 ms | 0 | 0 |
| Artwork detail | `/api/v1/artworks/:slug` | 198 | 120 ms | 185 ms | 0 | 0 |
| Artists with counts | `/api/v1/artists` | 566 | 40 ms | 84 ms | 0 | 0 |
| Journal list | `/api/v1/articles` | 700 | 33 ms | 66 ms | 0 | 0 |

Every scenario stayed well inside the 1 s p99 budget with zero errors. For a gallery-scale site (hundreds of concurrent visitors at peak, not thousands) one small instance is enough.

## Findings

1. **Artwork detail is the slowest route** (~200 req/s). It loads the work, its artist, related works and the same-artist rail in one request. If traffic grows: cache the detail response for anonymous users for 60 s (the data changes only when staff edit a work) and move related works to a single aggregation.
2. **The catalogue page** is bound by JSON size (24 works with image metadata). A CDN with short `s-maxage` on anonymous catalogue responses would take most of this load off the API.
3. **Rate limits work as designed.** The first run, with the normal test ceiling of 10,000 requests/min, returned 429s once that budget was spent, which is why the load run raises the ceiling. In production the per-IP limit is 300 requests/min.
4. Not covered: authenticated checkout flows and admin writes. They are low-volume and protected by stricter limits; the Playwright suite covers them for correctness.
