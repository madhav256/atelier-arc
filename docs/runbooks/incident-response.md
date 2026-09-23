# Incident response

## First 10 minutes
1. Decide severity. SEV1: checkout, payments or sign-in down, or data exposure. SEV2: admin or inquiries broken, degraded performance. SEV3: cosmetic or single-page issues.
2. Name one incident lead. Post status in the team channel every 30 minutes for SEV1.
3. Check `GET /health` and `GET /ready`, the host's error logs (JSON lines with `requestId`), MongoDB Atlas metrics, and the payment provider status page.
4. If a deploy happened in the last hour, [roll back](rollback.md).

## Common causes
- `/ready` returns 503: database unreachable. Check Atlas network access list, credentials and cluster health.
- Many `429 RATE_LIMITED`: traffic spike or abuse. Limits are per instance and in memory; for multi-instance deployments use a shared store (see PRODUCTION_INTEGRATIONS.md) and block abusive IPs at the edge.
- Orders stuck in `pending_payment`: see [Payments and webhooks](payments.md).
- Emails not arriving: check the email provider's suppression list and the API logs for `email` errors. Order and inquiry state is not affected; collectors can see updates in their account.

## Suspected data exposure or account compromise
1. Rotate the affected secrets ([Secret rotation](secret-rotation.md)). Rotating `JWT_REFRESH_SECRET` signs everyone out.
2. Disable affected staff accounts in Admin > Customers (this also ends their sessions).
3. Export the relevant audit log entries (Admin > Audit log); they cannot be edited or deleted.
4. Follow the legal notification duties for the jurisdictions involved (for India, the DPDP Act and CERT-In reporting within 6 hours for notifiable incidents).

## Afterwards
Write a short blameless review within five working days: timeline, impact, root cause, what went well, and follow-up actions with owners.
