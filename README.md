# Atelier Arc

A production-oriented MERN foundation for a luxury contemporary art dealership. The repository contains an independently deployable React/Vite storefront and Express/Mongoose API.

## Quick start

Requirements: Node 20+, npm 10+, MongoDB 7+.

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
- `npm test` - backend and frontend tests
- `npm run lint` - static checks
- `npm run seed -w backend` - reset and seed MongoDB

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
docs/                     architecture, API, deployment, audit
```

## Implemented flows

Luxury homepage and animated price discovery, URL-driven catalog filtering/sorting/search, artwork detail and simulated room viewer, My Collection client experience, cart and six-stage acquisition flow, authentication endpoints and role middleware, artist pages/timeline, editorial index, collector inquiry/advisory, admin dashboard foundation, deterministic recommendations, notification model/API, responsive layouts, reduced motion, metadata/canonical support, seed data, and core unit/component tests.

Provider-dependent systems are honest adapters, not fake integrations. Payment card collection, transactional email/SMS/push, cloud image transforms, address validation, tax/shipping quotes, refunds, and real AR must be connected before launch. See `docs/PRODUCTION_INTEGRATIONS.md`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Production integrations](docs/PRODUCTION_INTEGRATIONS.md)
- [Final audit](docs/FINAL_AUDIT.md)
