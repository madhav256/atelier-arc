# Payments and webhooks

Orders are confirmed only by a signed provider webhook (`POST /api/v1/webhooks/:provider`), never by the browser. Each event is stored in `paymentevents` with a unique `(provider, eventId)`, so replays are safe: a duplicate event is acknowledged and ignored.

## Order stuck in "pending payment"
1. Find the order in Admin > Orders and note `payment.intentId`.
2. Look up that payment in the provider dashboard (Stripe: Payments; Razorpay: Transactions).
3. If the provider shows it paid, resend the webhook from the provider dashboard (Stripe: Developers > Events > Resend; Razorpay: Webhooks > the event > Resend). The order moves to `confirmed`.
4. If the provider shows it unpaid or failed, do nothing. The inventory hold expires automatically (the `expire-holds` job runs every minute) and the work returns to sale. Admins can force it with `POST /api/v1/admin/maintenance/expire-holds`.
5. If webhooks fail repeatedly, check that the webhook secret in the host matches the provider dashboard and that the endpoint URL is reachable over HTTPS. Signature failures are logged with the request ID.

## Refunds
Admin > Orders > the order > Issue full refund. This calls the provider's refund API, marks the order `refunded`, returns the works to inventory, and writes an audit log entry. Partial refunds are handled in the provider dashboard and noted on the order.

## Testing
Local and CI use the built-in mock gateway (`PAYMENT_PROVIDER=mock`), which signs its own webhooks with `MOCK_WEBHOOK_SECRET` and runs the same confirmation path. Stripe and Razorpay both have free test modes; see PRODUCTION_INTEGRATIONS.md for the signup steps.
