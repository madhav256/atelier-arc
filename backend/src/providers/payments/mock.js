import crypto from 'crypto';
import { env } from '../../config/env.js';
import { hmac, safeEqual } from '../../lib/util.js';
import { AppError } from '../../lib/errors.js';

// Local development provider. Behaves like a real gateway: an intent is created,
// then a signed webhook moves the order forward. Refused in production (see config/env.js).
export const mockProvider = {
  name: 'mock',
  async createIntent({ order }) {
    const intentId = `mock_pi_${crypto.randomUUID().replaceAll('-', '')}`;
    return { intentId, clientSecret: `${intentId}_secret`, publicData: { mode: 'mock', amount: order.total, currency: order.currency } };
  },
  sign(rawBody) {
    return hmac(env.payments.mockWebhookSecret, rawBody);
  },
  parseWebhook(rawBody, headers) {
    const signature = headers['x-mock-signature'];
    if (!signature || !safeEqual(signature, this.sign(rawBody))) throw new AppError(400, 'Invalid webhook signature', 'BAD_SIGNATURE');
    const event = JSON.parse(rawBody);
    const types = { 'payment.succeeded': 'payment.succeeded', 'payment.failed': 'payment.failed', 'refund.succeeded': 'refund.succeeded' };
    return { id: event.id, type: types[event.type] || 'ignored', intentId: event.intentId, paymentId: event.intentId, raw: event };
  },
  async refund({ intentId }) {
    return { refundId: `mock_re_${intentId.slice(-12)}` };
  },
};
