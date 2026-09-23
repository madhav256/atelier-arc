# REST API

Base: `/api/v1`. Success: `{ success: true, data, meta? }`. Error: `{ success: false, error: { code, message, details?, requestId } }`.

## Public

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET /artworks?search=&category=&availability=&minPrice=&maxPrice=&sort=&page=&limit=`
- `GET /artworks/:slug`
- `GET /artists`, `GET /artists/:slug`
- `GET /collections`, `GET /articles`
- `POST /inquiries`
- `POST /orders` - scaffold only; connect inventory/quote/payment transaction before launch

## Authenticated

- `GET|POST /me/collections`
- `GET /me/notifications`

## Admin

- `GET /admin/analytics` requires `admin`.

CRUD expansion follows the same structure: Zod request schema → authentication → authorization → controller → service → model. Every inventory, price, order, refund, inquiry assignment, and publication mutation must be server-authorized and audit logged.

## v1 endpoint map (backend hardening phase)

All responses: `{ success, data, meta? }` or `{ success:false, error:{ code, message, details?, requestId } }`. Cookie-authenticated writes need the `X-CSRF-Token` header matching the `csrfToken` cookie (`GET /auth/csrf` sets it).

- Auth: `POST /auth/register|login|refresh|logout|logout-all|forgot-password|reset-password|verify-email|resend-verification|change-password`, `GET /auth/me`, `GET /auth/csrf`
- Catalog: `GET /artworks` (category, medium, availability, artist, collection, tag, color, minPrice, maxPrice, minYear, maxYear, orientation, featured, search, sort, page, limit), `GET /artworks/facets`, `GET /artworks/trending`, `GET /artworks/:slug` (includes `similar` and `jsonLd`), `GET /artists`, `GET /artists/:slug`, `GET /collections`, `GET /collections/:slug`, `GET /articles`, `GET /articles/:slug`, `GET /lookup/artworks?ids=`, `GET /seo/sitemap.xml`
- Cart and checkout: `GET /cart`, `POST /cart/items`, `PATCH|DELETE /cart/items/:artworkId`, `GET /checkout/delivery-methods`, `POST /checkout/quote`, `POST /checkout/orders`, `GET /orders/lookup?number=&email=`
- Payments: `POST /webhooks/:provider` (mock, stripe, razorpay; raw signed body), `POST /payments/mock/complete` (local only)
- Inquiries: `POST /inquiries`, `GET /shared/collections/:token`
- Account (`/me`): `GET|PATCH /profile`, collections CRUD and items, notifications (list, unread-count, read, read-all, delete), alerts, `POST|DELETE /following/:artistId`, `GET /recommendations`, `GET /orders`, `GET /orders/:number`, inquiries (list, detail, messages, appointment response, offer accept/decline)
- Admin (`/admin`, admin or advisor): `GET /analytics`, `GET /audit`, `GET /advisors`, `POST /uploads` (multipart `image`), `POST /maintenance/expire-holds`, `POST /orders/:id/status`, `POST /orders/:id/refund`, inquiry pipeline (`GET /inquiries/:id`, `POST /inquiries/:id/status|assign|notes|messages|appointments|offer`, `DELETE /inquiries/:id/offer`), and generic `GET|POST /:resource`, `GET|PATCH|DELETE /:resource/:id`, `POST /:resource/bulk`
