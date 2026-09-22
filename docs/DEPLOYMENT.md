# Deployment

## Suggested topology

- Frontend: Vercel, Netlify, or static CDN from `frontend/dist`
- API: Node container on Render, Fly.io, ECS, or Kubernetes
- Database: MongoDB Atlas with private networking, backups, point-in-time recovery
- Images: Cloudinary or S3 + image CDN, signed admin uploads
- Cache/jobs: Redis plus a queue worker for email, indexing, and notifications
- Observability: structured logs, Sentry/OpenTelemetry, uptime checks

Set production secrets only in the host secret store. Restrict CORS to exact storefront/admin origins. Terminate TLS at the edge, enable secure cookies, configure proxy trust, and use a persistent distributed rate limiter. Run `npm test`, `npm run lint`, and `npm run build` in CI. Seed data is not a migration system; use reviewed idempotent migrations for production.

Deploy frontend and API independently. Set `VITE_API_URL` at frontend build time. The API needs `MONGODB_URI`, strong distinct JWT secrets, origin allowlist, provider credentials, and a production log sink. `/health` is the liveness probe; add a separate readiness endpoint that checks Mongo and essential providers.
