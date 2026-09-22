# Production integrations

These cannot be honestly completed without merchant/provider accounts:

1. **Payments and refunds**: implement a PaymentProvider (`createIntent`, `confirmWebhook`, `refund`) using Stripe/Razorpay/Adyen. Compute totals and reserve inventory server-side in one transaction. Card data must never touch this API.
2. **Tax, shipping, address validation**: adapters must return signed, expiring quotes. Revalidate at final review.
3. **Images**: direct signed uploads to Cloudinary/S3, MIME sniffing, malware scan, pixel/size limits, EXIF stripping, responsive AVIF/WebP derivatives.
4. **Email/SMS/push**: queue notification events and deliver through verified templates. Record consent, provider IDs, retries, and suppressions.
5. **Email verification/reset**: single-use hashed tokens with short expiry and generic responses that do not enumerate accounts.
6. **Room view / AR**: replace the explicit 2D simulation with calibrated wall detection and artwork physical dimensions, while retaining the simulation fallback.
7. **Analytics/search**: connect privacy-respecting analytics. Atlas Search or Elasticsearch can replace Mongo text search for fuzzy, typo-tolerant ranking.

Never mark an acquisition confirmed from a browser redirect. Consume signed provider webhooks idempotently.
