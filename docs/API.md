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
