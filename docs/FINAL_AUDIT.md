# Final audit

Status at completion (Sept 24, 2026). Items move to "Done" only when code and tests exist in this repository.

## Done

- Split frontend/backend, production build, lint clean
- Security: helmet (strict API CSP, HSTS in production), CORS allow-list, body limits, NoSQL sanitisation, request IDs, per-route rate limits (API, auth, inquiries, uploads), trusted proxy
- Auth: bcrypt, 15 min access JWT, rotating single-use refresh tokens stored as hashes per device (max 5), reuse detection revokes all sessions, logout and logout-all, account lockout after repeated failures, constant-time-ish login, email verification and password reset with hashed single-use expiring tokens, non-enumerating responses, change password
- CSRF: double-submit cookie on every cookie-authenticated write; Bearer clients and signed webhooks exempt
- Validation: zod schemas for every write, field-level error details, honeypot on inquiries
- Catalog: facets, multi-value filters, weighted text search with typo-tolerant fallback, optional Atlas Search, trending, JSON-LD (VisualArtwork + Product/Offer) per artwork, sitemap generated from live records
- Commerce: server-side cart (guest cookie session, merged on sign-in), rule-based shipping/insurance/GST quotes that are HMAC-signed and expire, idempotent order creation, atomic stock reservation inside Mongo transactions (with compensation on standalone servers), 30 min inventory holds with background expiry, webhook-only confirmation, duplicate-event protection, automatic refund on late payment conflicts, order status workflow with transition rules, refunds
- Payments: mock, Stripe and Razorpay adapters with signature verification
- Inquiries and advisory: references, least-loaded advisor assignment, high-value priority, pipeline with transition rules, internal notes hidden from clients, client-visible message thread, viewing appointments with client confirm/decline, private offers that convert to orders at the negotiated price, offer expiry job
- Notifications: in-app centre (unread counts, read, read-all, delete), per-type email settings, availability alerts, artist follow alerts, order and inquiry events
- Recommendations: personal taste profile from saves, cart, views, purchases, follows and stated preferences, with price-band fit and artist variety cap; similar-works and popular fallback
- Admin: policy-driven CRUD for artworks, artists, collections, articles, customers; read access to orders and inquiries; search, filters, sort, pagination, bulk publish/feature; slug generation; delete guards; self-lockout protection; session revocation on role change; image upload pipeline (type sniffing, pixel limits, EXIF strip, WebP/AVIF derivatives, optional ClamAV); analytics dashboard; immutable audit log
- Ops: `/health` and `/ready`, graceful shutdown, index sync on boot, production config guard that refuses mock payments and missing secrets, seed guard against wiping production
- Tests: 27 backend tests including 19 integration tests on a real in-memory MongoDB replica set; frontend component tests
- Frontend wired to the API: admin CRUD screens, advisor inquiry dashboard, account area (orders, inquiries, viewings, offers, notifications, settings), checkout with the payment adapters, per-page SEO and JSON-LD, accessibility pass
- End-to-end: 41 Playwright tests (desktop and mobile) against a seeded database, including guest checkout to confirmed order, declined card, the full inquiry to private offer to paid order flow, and axe checks with no serious violations on public, account and admin screens
- CI: GitHub Actions runs lint, tests, build, production dependency audit gate, SBOM artifact and the Playwright suite
- Load: autocannon test of the public API, zero errors and p99 under 200 ms at 25 connections on a 2 vCPU box ([LOAD_TEST.md](LOAD_TEST.md))
- Supply chain: 0 production vulnerabilities, dev tooling upgraded (Vite 8, Vitest 5), CycloneDX SBOM ([SECURITY_AUDIT.md](SECURITY_AUDIT.md))
- Runbooks: deploy, rollback, incident response, payments, backup and restore, secret rotation, staff access ([runbooks](runbooks/README.md))

## Honest abstractions and known limits

- Payments run on the mock gateway locally and in CI. Stripe and Razorpay adapters are written and signature-verified but have not been run against real test-mode keys.
- Email goes to the console and images to local disk until SMTP and Cloudinary credentials are added.
- Tax and shipping are rule-based quotes, not carrier or tax-service rates. No address validation service.
- The room viewer is a simulated 2D placement, not real AR.
- One moderate advisory remains in a dev-only load-test dependency (see SECURITY_AUDIT.md).
- Load numbers come from a small shared sandbox; rerun on production-like hardware before a launch event.

## Needs the owner (only for launch)

See `PRODUCTION_INTEGRATIONS.md` for the free signups (Stripe or Razorpay test mode, SMTP, Cloudinary, Atlas).
