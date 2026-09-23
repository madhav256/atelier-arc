# Deploy

1. Confirm CI is green on the commit (lint, unit and integration tests, build, production dependency audit, Playwright + axe).
2. Check for schema changes in `backend/src/models`. Mongoose adds new optional fields safely. Renamed or retyped fields need a reviewed, idempotent migration script run before the new API version takes traffic. Never run `npm run seed` against production; it refuses unless `ALLOW_PRODUCTION_SEED=true` and it wipes data.
3. Deploy the API first. Required environment: `NODE_ENV=production`, `MONGODB_URI`, distinct random `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `QUOTE_SECRET` (32+ bytes each), `CLIENT_ORIGINS`, a real `PAYMENT_PROVIDER` (`stripe` or `razorpay`; `mock` is refused in production) with its keys and webhook secret, `EMAIL_PROVIDER`, `STORAGE_PROVIDER`. Background jobs run on every instance by default; with more than one instance, set `JOBS_ENABLED=false` on all but one.
4. Wait for `GET /ready` to return 200 on the new instances before shifting traffic.
5. Build the storefront with `VITE_API_URL` pointing at the API and publish `frontend/dist` (single-page app: route unknown paths to `index.html`).
6. Smoke test in production: home page loads works, one artwork page, sign in as a staff account, open the admin dashboard, and confirm the payment provider dashboard shows the webhook endpoint as healthy.
7. Watch error rate and p99 latency for 15 minutes. If checkout, sign-in or the admin break, follow [Rollback](rollback.md).
