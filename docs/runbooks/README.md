# Runbooks

Short, tested procedures for operating Atelier Arc. Each one says when to use it, what to check first, the steps, and how to confirm it worked.

| Runbook | Use when |
| --- | --- |
| [Deploy](deploy.md) | Shipping a new version of the API or storefront |
| [Rollback](rollback.md) | A release breaks checkout, sign-in or the admin |
| [Incident response](incident-response.md) | Errors spike, the site is down, or data looks wrong |
| [Payments and webhooks](payments.md) | An order is stuck in "pending payment", a webhook failed, or a refund is needed |
| [Backup and restore](backup-restore.md) | Restoring data, or the quarterly restore drill |
| [Secret rotation](secret-rotation.md) | A secret may have leaked, a staff member leaves, or the scheduled rotation is due |
| [Staff access](staff-access.md) | Adding or removing an admin or advisor, or a locked-out account |

Health endpoints: `GET /health` (process is up) and `GET /ready` (database connected; returns 503 otherwise). Every API response carries an `X-Request-Id`; quote it when reporting a problem, it appears in the structured logs and the audit log.
