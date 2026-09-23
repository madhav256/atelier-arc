import { env } from '../../config/env.js';
import { hmac, safeEqual } from '../../lib/util.js';
import { AppError } from '../../lib/errors.js';

// Razorpay via REST. Works with free test-mode keys (rzp_test_...).
const API = 'https://api.razorpay.com/v1';

async function call(path, body) {
  const { razorpayKeyId: id, razorpayKeySecret: secret } = env.payments;
  if (!id || !secret) throw new AppError(503, 'Razorpay is not configured', 'PAYMENTS_UNAVAILABLE');
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new AppError(502, data.error?.description || 'Payment provider error', 'PAYMENT_PROVIDER_ERROR');
  return data;
}

export const razorpayProvider = {
  name: 'razorpay',
  supportsEmi: true,
  async createIntent({ order }) {
    const rzp = await call('/orders', {
      amount: Math.round(order.total * 100),
      currency: order.currency,
      receipt: order.number,
      notes: { orderId: String(order._id) },
    });
    return { intentId: rzp.id, publicData: { mode: 'razorpay', keyId: env.payments.razorpayKeyId, orderId: rzp.id, amount: rzp.amount } };
  },
  parseWebhook(rawBody, headers) {
    const expected = hmac(env.payments.razorpayWebhookSecret || '', rawBody);
    if (!env.payments.razorpayWebhookSecret || !safeEqual(headers['x-razorpay-signature'] || '', expected)) {
      throw new AppError(400, 'Invalid webhook signature', 'BAD_SIGNATURE');
    }
    const event = JSON.parse(rawBody);
    const payment = event.payload?.payment?.entity || {};
    const refund = event.payload?.refund?.entity;
    const map = { 'payment.captured': 'payment.succeeded', 'order.paid': 'payment.succeeded', 'payment.failed': 'payment.failed', 'refund.processed': 'refund.succeeded' };
    const id = headers['x-razorpay-event-id'] || `${event.event}:${payment.id || refund?.id}`;
    return { id, type: map[event.event] || 'ignored', intentId: payment.order_id || event.payload?.order?.entity?.id, paymentId: payment.id || refund?.payment_id, method: payment.method, raw: event };
  },
  async refund({ paymentId, amount }) {
    const refund = await call(`/payments/${paymentId}/refund`, amount ? { amount: Math.round(amount * 100) } : {});
    return { refundId: refund.id };
  },
};
