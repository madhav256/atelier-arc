import { Order, PaymentEvent } from '../models/index.js';
import { providerByName } from '../providers/payments/index.js';
import { confirmOrder, releaseOrder } from './orderService.js';

// Verifies, de-duplicates and applies a provider webhook. Only webhooks move money state.
export async function handleWebhook(providerName, rawBody, headers) {
  const provider = providerByName(providerName);
  const event = provider.parseWebhook(rawBody, headers);
  try {
    await PaymentEvent.create({ provider: providerName, eventId: event.id, type: event.type, intentId: event.intentId, payload: event.raw });
  } catch (err) {
    if (err.code === 11000) return { duplicate: true };
    throw err;
  }
  let result = { ignored: true };
  if (event.type !== 'ignored' && event.intentId) {
    const order = await Order.findOne({ 'payment.intentId': event.intentId });
    if (order) {
      if (event.type === 'payment.succeeded') result = await confirmOrder(order, { paymentId: event.paymentId, method: event.method, emiTenure: event.emiTenure });
      else if (event.type === 'payment.failed') {
        await Order.updateOne({ _id: order._id }, { 'payment.status': 'failed' });
        await releaseOrder(order, 'payment_failed', 'Payment was declined');
        result = { failed: true };
      } else if (event.type === 'refund.succeeded') {
        await Order.updateOne({ _id: order._id, status: { $ne: 'refunded' } }, { status: 'refunded', 'payment.status': 'refunded', 'payment.refundedAt': new Date(), $push: { history: { status: 'refunded', note: 'Refund confirmed by provider' } } });
        result = { refunded: true };
      }
    }
  }
  await PaymentEvent.updateOne({ provider: providerName, eventId: event.id }, { processedAt: new Date() });
  return result;
}
