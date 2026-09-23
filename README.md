# Atelier Arc

A production-oriented MERN foundation for a luxury contemporary art dealership. The repository contains an independently deployable React/Vite storefront and Express/Mongoose API.

## Quick start

Requirements: Node 20.19+ (22 recommended), npm 10+, MongoDB 7+ (run it as a replica set, even single-node, so orders use transactions).

```bash
cp .env.example .env
npm install
npm run seed -w backend
npm run dev
```

Storefront: `http://localhost:5173` · API: `http://localhost:4000/api/v1` · health check: `http://localhost:4000/health`.

The seed creates 15 fictional artists, 50 original fictional artworks, 8 collections, 10 journal stories, and local-only accounts: `admin@atelierarc.example`, `advisor@atelierarc.example`, `advisor2@atelierarc.example`, `collector@atelierarc.example`, all with the password from `SEED_PASSWORD` (default `ChangeMe123!`). The seed refuses to run against production. Payments, email and image storage run in free local modes by default; see `docs/PRODUCTION_INTEGRATIONS.md` to switch providers.

## Commands

- `npm run dev` - run API and storefront
- `npm run build` - production storefront build
- `npm test` - backend (27, incl. integration tests on an in-memory MongoDB replica set) and frontend tests
- `npm run lint` - static checks
- `npm run seed -w backend` - reset and seed MongoDB
- `npm run test:e2e` - Playwright end-to-end and axe accessibility suite (41 tests, desktop and mobile). Starts its own in-memory MongoDB replica set, seeded API and Vite dev server. First run: `npx playwright install chromium`
- `npm run test:load` - autocannon load test against a running, seeded API; see [docs/LOAD_TEST.md](docs/LOAD_TEST.md)

CI (GitHub Actions, `.github/workflows/ci.yml`) runs lint, tests, build, the dependency audit gate, SBOM generation and the Playwright suite on every push and pull request.

## Structure

```
frontend/src/components   reusable UI
frontend/src/pages        route-level screens (lazy loaded)
frontend/src/lib          API and formatting utilities
backend/src/controllers   transport-level request handling
backend/src/services      business logic
backend/src/models        Mongoose schemas and indexes
backend/src/middleware    auth, authorization, validation
backend/src/lib           errors, filtering, recommendation scoring
backend/src/routes        versioned REST routing
e2e/                      Playwright + axe end-to-end suite
backend/load/             autocannon load test
docs/                     architecture, API, deployment, audit, runbooks
```

## Implemented flows

Editorial homepage, URL-driven catalogue with facets, sorting and typo-tolerant search, artwork detail with JSON-LD and a simulated room viewer, artist and collection pages, journal, saved works and taste-based recommendations, server-side cart, signed shipping/insurance/GST quotes, checkout through the payment adapters with inventory holds and webhook-only confirmation, order status lookup, collector account (orders, inquiries with message thread, viewings, private offers, notifications, settings), advisor inquiry pipeline, admin CRUD, uploads, analytics and audit log, and full auth (verification, reset, lockout, rotating refresh tokens, CSRF).

Documents: every published work has a downloadable provenance dossier (`GET /api/v1/artworks/:slug/provenance.pdf`, A4, two pages). Once an order is confirmed, the collector can download a numbered certificate of authenticity for each work from the order page (`GET /api/v1/me/orders/:number/certificates/:artworkId`, owner or staff only). Each certificate carries a code signed with `CERTIFICATE_SECRET` that anyone can check at `/verify`. The returns and authenticity guarantee page is at `/guarantee`, linked from every artwork page and the footer. Its terms (return window, damage-report window, refund timing, exclusions) are draft placeholders in `frontend/src/content/guarantee.js` and `frontend/src/pages/Guarantee.jsx`; the owner must confirm them before launch. PDFs are rendered with pdfkit in Libre Caslon (OFL, bundled in `backend/assets/fonts`).

Provider-dependent systems are honest adapters, not fake integrations. Locally, payments use a mock gateway with signed webhooks, email is written to the console, and images are stored on disk. Real Stripe or Razorpay keys, an SMTP provider, Cloudinary and MongoDB Atlas are free signups for the owner; real AR, address validation and carrier-rated shipping are not built. See `docs/PRODUCTION_INTEGRATIONS.md`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Production integrations](docs/PRODUCTION_INTEGRATIONS.md)
- [Runbooks](docs/runbooks/README.md): deploy, rollback, incident response, payments, backup and restore, secret rotation, staff access
- [Motion](docs/MOTION.md)
- [Load test](docs/LOAD_TEST.md)
- [Dependency audit and SBOM](docs/SECURITY_AUDIT.md)
- [Final audit](docs/FINAL_AUDIT.md)
