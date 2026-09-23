# Production integrations

Every external service sits behind an adapter with a working local mode, so the whole platform runs end to end with no accounts and no cost. Switching to a real provider is configuration only (`.env`). No accounts have been created on anyone's behalf.

| Area | Local mode (default, free) | Real adapters in the code | Env switch |
| --- | --- | --- | --- |
| Payments | `mock`: real intent + signed webhook pipeline, completed via `POST /api/v1/payments/mock/complete` (disabled in production) | Stripe (REST, test mode), Razorpay (REST, test mode) | `PAYMENT_PROVIDER` |
| Email | `console`: logs to stdout, keeps an in-memory outbox | Any SMTP server (nodemailer) | `EMAIL_PROVIDER` |
| Images | `local`: EXIF-stripped JPEG master + WebP/AVIF derivatives on disk, served at `/uploads` | Cloudinary signed upload | `STORAGE_PROVIDER` |
| Films | `local`: MP4 (H.264) or WebM stored as uploaded, type-sniffed, size-capped at 80 MB, ClamAV-scanned when configured; ffprobe reads duration and size and ffmpeg takes a poster frame when installed (both free, optional) | Cloudinary signed upload to the `video` resource type (same account and keys as images) | `STORAGE_PROVIDER` |
| Malware scan | off | ClamAV `INSTREAM` (self-hosted Docker, free) | `CLAMAV_HOST` |
| Search | Mongo weighted `$text` + typo-tolerant fallback | Atlas Search `$search` with fuzzy matching | `SEARCH_PROVIDER` |
| Shipping, insurance, tax | Rule-based quotes, HMAC-signed, 30 min expiry, revalidated at order time | Same `computeQuote()` signature for a carrier/tax API | `ORIGIN_COUNTRY`, `DOMESTIC_TAX_RATE`, `INSURANCE_RATE` |
| Address checks | Structural validation (IN PIN, US ZIP, UK postcode) | Swap `validateAddress()` for a verification API | - |

## Free signups the owner would need to do (only when going live)

Nothing below is required for local development or testing.

### Stripe test mode (free, no card needed)
1. Create an account at https://dashboard.stripe.com/register.
2. Stay in **Test mode**. Developers → API keys: copy `sk_test_...` and `pk_test_...` into `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`.
3. Developers → Webhooks → Add endpoint `https://<api-host>/api/v1/webhooks/stripe` with events `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
   Locally you can use the free Stripe CLI: `stripe listen --forward-to localhost:4000/api/v1/webhooks/stripe`.
4. Set `PAYMENT_PROVIDER=stripe`. Test card: 4242 4242 4242 4242.

### Razorpay test mode (free, India)
1. Sign up at https://dashboard.razorpay.com/signup and stay in **Test Mode**.
2. Settings → API Keys → Generate test key: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
3. Settings → Webhooks → `https://<api-host>/api/v1/webhooks/razorpay`, events `payment.captured`, `payment.failed`, `refund.processed`, with a secret you choose (`RAZORPAY_WEBHOOK_SECRET`).
4. Set `PAYMENT_PROVIDER=razorpay`.

### Email over SMTP (free tiers)
Any SMTP provider works. Brevo (300 emails/day free) or a Gmail app password for low volume. Put host, port, user and password in `SMTP_*` and set `EMAIL_PROVIDER=smtp`. Verify the sending domain (SPF/DKIM) before real customers.

### Cloudinary (free plan)
Sign up at https://cloudinary.com/users/register_free, copy cloud name, API key and secret into `CLOUDINARY_*`, set `STORAGE_PROVIDER=cloudinary`.

### MongoDB Atlas (free M0 cluster)
Create an M0 cluster, add a database user and network rule, set `MONGODB_URI`. Atlas is a replica set, so checkout runs inside real transactions. For fuzzy search, create an Atlas Search index named `artworks` on the `artworks` collection with dynamic mappings and set `SEARCH_PROVIDER=atlas`.

### Artwork films

Three seeded works (After the Monsoon, Quiet Geometry, Night Orchard) carry placeholder films: an eight-second slow pass over the artwork image made with ffmpeg, in `frontend/public/film`, flagged `placeholder: true` so the admin editor labels them. Replace them from Admin > Artworks > Film with studio footage. Export at 1080p or below with faststart (`ffmpeg -i in.mov -c:v libx264 -crf 23 -movflags +faststart -an out.mp4`). Films never autoplay and show native controls, so reduced-motion users are never shown moving images without asking.

## Rules that hold regardless of provider

- An order is confirmed only by a signed provider webhook, never by a browser redirect. Webhook events are stored with a unique `(provider, eventId)` index so retries are no-ops.
- Totals are always computed on the server from database prices. The client sees a signed quote; any change to cart, destination or delivery method invalidates it.
- If payment lands after a reservation expired and the work was sold to someone else, the order is refunded automatically.
- Card data never touches this API. Stripe Elements / Razorpay Checkout collect it in the browser.
- AR is free and account-free: `<model-viewer>` with WebXR, Scene Viewer (Android) and Quick Look (iOS), fed by a GLB the API builds at true scale. Wall detection and scale come from the device (ARCore/ARKit). Flat works only; sculpture would need a scanned model (photogrammetry, e.g. free Apple Object Capture or Polycam's free tier), which is not built. The 2D room view remains for desktop and unsupported devices.

## EMI (monthly instalments) at checkout

What collectors see: on the payment step, INR orders at or above `EMI_MIN_AMOUNT` offer "In full" or "In monthly instalments". The instalment option lists each tenure with the price divided evenly and says plainly that the bank's interest comes on top. Atelier Arc never shows an interest rate of its own, because the bank sets it and Razorpay shows the exact plan before the collector confirms. The gallery is paid in full; the collector's bank collects the instalments. Confirmed orders record `payment.method` (`emi` when paid that way) and, in test mode, the chosen tenure. The confirmation page shows "Paid through your bank in N monthly instalments".

How it is built:
- `backend/src/providers/payments/emi.js` decides availability: EMI enabled, provider has `supportsEmi`, currency INR, total at least `EMI_MIN_AMOUNT`. The mock and Razorpay adapters support it; Stripe does not (card EMI in India is a Razorpay feature here).
- With Razorpay, choosing instalments opens Standard Checkout with a `config.display` block that puts EMI (`method: emi`) and cardless EMI (`method: cardless_emi`) first, with all other methods still below. Razorpay's webhook reports `payment.method`, which we store.
- With the mock gateway (local and CI), the collector picks a tenure and the signed test webhook carries it, so the whole flow runs without an account.

Settings: `EMI_ENABLED` (default `true`), `EMI_MIN_AMOUNT` in rupees (default `5000`, which matches the lowest common bank minimums Razorpay lists), `EMI_TENURES` (default `3,6,9,12`, shown to collectors as a guide only).

Free signup for test mode (no spend, not done on your behalf):
1. Create a Razorpay account at https://dashboard.razorpay.com/signup and stay in Test Mode.
2. Account & Settings > API Keys > generate test keys (`rzp_test_...`). Set `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
3. Account & Settings > Webhooks > add `https://<your-api>/api/v1/webhooks/razorpay` with `payment.captured`, `payment.failed` and `refund.processed`, and set `RAZORPAY_WEBHOOK_SECRET`.
4. Check Account & Settings > Payment Methods to see which EMI types are on. Card EMI is on by default for Standard Checkout; cardless EMI needs Razorpay's approval. Going live needs KYC.

Sources: https://razorpay.com/docs/payments/payment-methods/emi/credit-card-emi/ (EMI is on by default in Standard Checkout), https://razorpay.com/docs/payments/payment-methods/emi/faqs (bank minimums from ₹5,000), https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/display-configuration/ (display blocks).
