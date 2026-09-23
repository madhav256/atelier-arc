# Backup and restore

## What to back up
- MongoDB: all collections. Orders, payment events and the audit log are the records that matter most.
- Uploaded images: the storage bucket (or `backend/uploads` in local mode).
- Configuration: environment variables live in the host's secret store, not in the repo.

## Backups
- MongoDB Atlas: enable continuous cloud backup with point-in-time recovery on production clusters (paid tiers). On the free M0 tier, run a nightly `mongodump --uri "$MONGODB_URI" --gzip --archive=atelier-$(date +%F).gz` from a scheduled job and keep 30 days off-site.
- Images: enable object versioning on the bucket.

## Restore a whole database
1. Put the storefront in maintenance mode, or scale the API to zero, so no new orders are written.
2. Restore into a new database: `mongorestore --uri "$NEW_URI" --gzip --archive=atelier-YYYY-MM-DD.gz` (or an Atlas point-in-time restore to a new cluster).
3. Point `MONGODB_URI` at it, deploy, and wait for `/ready`.
4. Reconcile payments made after the backup time against the payment provider dashboard, and resend their webhooks so the orders are recreated in the right state.

## Restore one collection
`mongorestore --uri "$MONGODB_URI" --gzip --archive=file.gz --nsInclude='atelier_arc.artworks' --drop` restores just that collection. Never drop `auditlogs`; restore it into a separate database for inspection.

## Drill
Once a quarter, restore the latest backup into a scratch database, run `npm test` against it with `MONGODB_URI` set, and record how long it took.
