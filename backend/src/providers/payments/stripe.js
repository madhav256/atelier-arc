import { env } from '../../config/env.js';
import { hmac, safeEqual } from '../../lib/util.js';
import { AppError } from '../../lib/errors.js';

// Stripe via its REST API (no SDK needed). Works with free test-mode keys (sk_test_...).
const API = 'https://api.stripe.com/v1';
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND']);
export const toMinorUnits = (amount, currency) => (ZERO_DECIMAL.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100));

async function call(path, params, idempotencyKey) {
  if (!env.payments.stripeSecretKey) throw new AppError(503, 'Stripe is not configured', 'PAYMENTS_UNAVAILABLE');
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.payments.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }),
    },
    body: new URLSearchParams(params),
  });
  const body = await res.json();
  if (!res.ok) throw new AppError(502, body.error?.message || 'Payment provider error', 'PAYMENT_PROVIDER_ERROR');
  return body;
}

export function verifyStripeSignature(rawBody, header, secret, toleranceSeconds = 300, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const signatures = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(now / 1000 - timestamp) > toleranceSeconds) return false;
  const expected = hmac(secret, `${timestamp}.${rawBody}`);
  return signatures.some((sig) => safeEqual(sig, expected));
}

export const stripeProvider = {
  name: 'stripe',
  async createIntent({ order }) {
    const intent = await call(
      '/payment_intents',
      {
        amount: String(toMinorUnits(order.total, order.currency)),
        currency: order.currency.toLowerCase(),
        'automatic_payment_methods[enabled]': 'true',
        receipt_email: order.email,
        'metadata[orderId]': String(order._id),
        'metadata[orderNumber]': order.number,
      },
      `order-${order._id}`,
    );
    return { intentId: intent.id, clientSecret: intent.client_secret, publicData: { mode: 'stripe', publishableKey: process.env.STRIPE_PUBLISHABLE_KEY } };
  },
  parseWebhook(rawBody, headers) {
    if (!verifyStripeSignature(rawBody, headers['stripe-signature'], env.payments.stripeWebhookSecret)) {
      throw new AppError(400, 'Invalid webhook signature', 'BAD_SIGNATURE');
    }
    const event = JSON.parse(rawBody);
    const object = event.data?.object || {};
    const map = {
      'payment_intent.succeeded': 'payment.succeeded',
      'payment_intent.payment_failed': 'payment.failed',
      'charge.refunded': 'refund.succeeded',
    };
    return { id: event.id, type: map[event.type] || 'ignored', intentId: object.payment_intent || object.id, paymentId: object.latest_charge || object.id, raw: event };
  },
  async refund({ intentId, amount, currency }) {
    const params = { payment_intent: intentId };
    if (amount) params.amount = String(toMinorUnits(amount, currency || 'INR'));
    const refund = await call('/refunds', params, `refund-${intentId}`);
    return { refundId: refund.id };
  },
};
