# Production integrations

Every external service sits behind an adapter with a working local mode, so the whole platform runs end to end with no accounts and no cost. Switching to a real provider is configuration only (`.env`). No accounts have been created on anyone's behalf.

| Area | Local mode (default, free) | Real adapters in the code | Env switch |
| --- | --- | --- | --- |
| Payments | `mock`: real intent + signed webhook pipeline, completed via `POST /api/v1/payments/mock/complete` (disabled in production) | Stripe (REST, test mode), Razorpay (REST, test mode) | `PAYMENT_PROVIDER` |
| Email | `console`: logs to stdout, keeps an in-memory outbox | Any SMTP server (nodemailer) | `EMAIL_PROVIDER` |
| Images | `local`: EXIF-stripped JPEG master + WebP/AVIF derivatives on disk, served at `/uploads` | Cloudinary signed upload | `STORAGE_PROVIDER` |
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

## Rules that hold regardless of provider

- An order is confirmed only by a signed provider webhook, never by a browser redirect. Webhook events are stored with a unique `(provider, eventId)` index so retries are no-ops.
- Totals are always computed on the server from database prices. The client sees a signed quote; any change to cart, destination or delivery method invalidates it.
- If payment lands after a reservation expired and the work was sold to someone else, the order is refunded automatically.
- Card data never touches this API. Stripe Elements / Razorpay Checkout collect it in the browser.
- Real AR (calibrated wall detection) is not included. The room view is an explicit 2D simulation using the work's real dimensions.
