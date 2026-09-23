# Rollback

Roll back first, investigate second.

1. Redeploy the previous API image or commit (`git log --oneline` on `main`; each deploy should be tagged). The API is stateless apart from MongoDB, so this is safe as long as no destructive migration ran.
2. Republish the previous `frontend/dist`. Old and new frontends both talk to the same `/api/v1`, so either order works for additive changes.
3. If a migration ran, check whether the old code can read the new documents. If not, restore only the affected collections from the pre-deploy snapshot ([Backup and restore](backup-restore.md)) and reconcile orders placed since the snapshot using the payment provider dashboard.
4. Confirm `GET /ready` is 200, place a test inquiry, and check the payment provider still reaches the webhook.
5. Record the incident: what broke, the request IDs, and the commit range, then open a fix with a test that reproduces it.
