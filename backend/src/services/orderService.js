import { Artwork, Order, InventoryHold, Inquiry, nextSequence } from '../models/index.js';
import { AppError } from '../lib/errors.js';
import { env } from '../config/env.js';
import { withTransaction } from '../lib/transaction.js';
import { pricedCart, clearCart } from './cartService.js';
import { computeQuote, signQuote, verifyQuote, validateAddress } from '../providers/commerce/quotes.js';
import { paymentProvider } from '../providers/payments/index.js';
import { notify, notifyAvailability } from './notificationService.js';
import { sendEmail } from '../providers/email/index.js';
import { templates } from '../providers/email/templates.js';

const ownerKey = (owner) => (owner.userId ? `u:${owner.userId}` : `s:${owner.sessionId}`);

export async function quoteCart(owner, { address, deliveryMethod }) {
  const cart = await pricedCart(owner);
  if (!cart.purchasableCount) throw new AppError(409, 'Your cart has no works available to acquire', 'CART_EMPTY');
  const check = validateAddress(address);
  if (!check.valid) throw new AppError(422, 'Please check the delivery address', 'INVALID_ADDRESS', { fieldErrors: check.errors });
  const quote = computeQuote({ subtotal: cart.subtotal, address, deliveryMethod, currency: cart.currency });
  const signed = signQuote(quote, { owner: ownerKey(owner), cart: cart.signature, country: address.country });
  return { ...quote, lines: cart.lines, quoteToken: signed.token, expiresAt: signed.expiresAt };
}

async function orderNumber() {
  return `AA-${new Date().getFullYear()}-${String(await nextSequence('order')).padStart(6, '0')}`;
}

// Atomically reserves each line. Without a transaction, reservations made so far are rolled back on conflict.
async function reserve(lines, session) {
  const done = [];
  try {
    for (const line of lines) {
      const updated = await Artwork.findOneAndUpdate(
        { _id: line.artworkId, published: true, availability: { $ne: 'sold' }, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } },
        { new: true, session },
      );
      if (!updated) throw new AppError(409, `${line.title} was just reserved by another collector`, 'ARTWORK_UNAVAILABLE', { artworkId: line.artworkId });
      done.push(line);
      if (updated.stock === 0) await Artwork.updateOne({ _id: updated._id }, { availability: 'reserved' }, { session });
    }
  } catch (err) {
    if (!session) {
      for (const line of done) await Artwork.updateOne({ _id: line.artworkId }, { $inc: { stock: line.quantity }, availability: 'available' });
    }
    throw err;
  }
}

async function createPendingOrder({ owner, email, lines, totals, address, billingAddress, deliveryMethod, idempotencyKey, offerId, clear }) {
  const number = await orderNumber();
  const holdExpiresAt = new Date(Date.now() + env.holdMinutes * 60_000);
  const order = await withTransaction(async (session) => {
    await reserve(lines, session);
    const [created] = await Order.create(
      [
        {
          number,
          user: owner.userId,
          email,
          items: lines.map((l) => ({ artwork: l.artworkId, title: l.title, artistName: l.artistName, image: l.image, quantity: l.quantity, unitPrice: l.unitPrice })),
          shippingAddress: address,
          billingAddress: billingAddress || address,
          deliveryMethod,
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          insurance: totals.insurance,
          tax: totals.tax,
          total: totals.total,
          currency: totals.currency,
          holdExpiresAt,
          idempotencyKey,
          offer: offerId,
          history: [{ status: 'pending_payment', note: 'Works reserved while payment completes' }],
        },
      ],
      { session },
    );
    await InventoryHold.create(
      lines.map((l) => ({ artwork: l.artworkId, order: created._id, quantity: l.quantity, expiresAt: holdExpiresAt })),
      { session, ordered: true },
    );
    if (clear) await clearCart(owner, session);
    return created;
  });

  try {
    const provider = paymentProvider();
    const intent = await provider.createIntent({ order });
    order.payment = { provider: provider.name, intentId: intent.intentId, status: 'requires_payment' };
    await order.save();
    return { order, payment: { provider: provider.name, clientSecret: intent.clientSecret, ...intent.publicData } };
  } catch (err) {
    await releaseOrder(order, 'payment_failed', 'Payment could not be started');
    throw err;
  }
}

export async function checkout(owner, input) {
  if (input.idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey: input.idempotencyKey, ...(owner.userId ? { user: owner.userId } : { email: input.email }) });
    if (existing) return { order: existing, payment: { provider: existing.payment?.provider, replayed: true } };
  }
  const quote = verifyQuote(input.quoteToken);
  const cart = await pricedCart(owner);
  if (quote.owner !== ownerKey(owner) || quote.cart !== cart.signature || quote.country !== input.address.country || quote.deliveryMethod !== input.deliveryMethod) {
    throw new AppError(409, 'Your order changed since the last review. Please confirm the updated total.', 'QUOTE_CHANGED');
  }
  const lines = cart.lines.filter((l) => !l.issue);
  return createPendingOrder({ owner, email: input.email, lines, totals: quote, address: input.address, billingAddress: input.billingAddress, deliveryMethod: input.deliveryMethod, idempotencyKey: input.idempotencyKey, clear: true });
}

// A client accepts an advisor's private offer: one line at the negotiated price.
export async function checkoutOffer(userId, inquiryId, { address, deliveryMethod, email }) {
  const inquiry = await Inquiry.findOne({ _id: inquiryId, user: userId }).populate({ path: 'artwork', populate: { path: 'artist', select: 'name' } });
  if (!inquiry?.offer || inquiry.offer.status !== 'open') throw new AppError(409, 'There is no open offer on this inquiry', 'NO_OFFER');
  if (inquiry.offer.expiresAt < new Date()) throw new AppError(409, 'This offer has expired. Your advisor can extend it.', 'OFFER_EXPIRED');
  const check = validateAddress(address);
  if (!check.valid) throw new AppError(422, 'Please check the delivery address', 'INVALID_ADDRESS', { fieldErrors: check.errors });
  const a = inquiry.artwork;
  const lines = [{ artworkId: a._id, title: a.title, artistName: a.artist?.name, image: a.images?.[0]?.url, quantity: 1, unitPrice: inquiry.offer.amount }];
  const totals = computeQuote({ subtotal: inquiry.offer.amount, address, deliveryMethod, currency: inquiry.offer.currency || 'INR' });
  const result = await createPendingOrder({ owner: { userId }, email, lines, totals, address, deliveryMethod, offerId: inquiry._id });
  inquiry.offer.status = 'accepted';
  inquiry.offer.order = result.order._id;
  inquiry.status = 'negotiation';
  await inquiry.save();
  return result;
}

export async function releaseOrder(order, status = 'cancelled', note) {
  const released = await withTransaction(async (session) => {
    const holds = await InventoryHold.find({ order: order._id, status: 'held' }).session(session);
    for (const hold of holds) {
      const res = await InventoryHold.updateOne({ _id: hold._id, status: 'held' }, { status: 'released' }, { session });
      if (res.modifiedCount) await Artwork.updateOne({ _id: hold.artwork }, { $inc: { stock: hold.quantity }, availability: 'available' }, { session });
    }
    await Order.updateOne({ _id: order._id, status: { $in: ['pending_payment', 'payment_failed'] } }, { status, $push: { history: { status, note } } }, { session });
    return holds.map((h) => h.artwork);
  });
  for (const artworkId of released) {
    const artwork = await Artwork.findById(artworkId).lean();
    if (artwork) await notifyAvailability(artwork);
  }
  if (order.offer) await Inquiry.updateOne({ _id: order.offer, 'offer.order': order._id }, { 'offer.status': 'open', $unset: { 'offer.order': 1 } });
}

export async function confirmOrder(order, { paymentId } = {}) {
  const outcome = await withTransaction(async (session) => {
    const fresh = await Order.findOneAndUpdate(
      { _id: order._id, status: { $in: ['pending_payment', 'payment_failed', 'cancelled'] } },
      { status: 'confirmed', 'payment.status': 'succeeded', 'payment.paidAt': new Date(), 'payment.chargeId': paymentId, $push: { history: { status: 'confirmed', note: 'Payment received' } } },
      { new: true, session },
    );
    if (!fresh) return { already: true };
    for (const item of fresh.items) {
      const hold = await InventoryHold.findOneAndUpdate({ order: fresh._id, artwork: item.artwork, status: 'held' }, { status: 'converted' }, { session });
      if (!hold) {
        // The hold expired before payment landed. Re-reserve if the work is still free.
        const again = await Artwork.findOneAndUpdate({ _id: item.artwork, availability: { $ne: 'sold' }, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true, session });
        if (!again) throw new AppError(409, 'Artwork no longer available for late payment', 'LATE_PAYMENT_CONFLICT');
        await InventoryHold.create([{ artwork: item.artwork, order: fresh._id, quantity: item.quantity, status: 'converted', expiresAt: new Date() }], { session });
      }
      const art = await Artwork.findById(item.artwork).session(session);
      if (art && art.stock === 0) await Artwork.updateOne({ _id: art._id }, { availability: 'sold' }, { session });
    }
    if (fresh.offer) await Inquiry.updateOne({ _id: fresh.offer }, { status: 'acquired', $push: { history: { status: 'acquired' } } }, { session });
    return { order: fresh };
  }).catch(async (err) => {
    if (err.code !== 'LATE_PAYMENT_CONFLICT') throw err;
    await refundOrder(order, 'Automatic refund: payment arrived after the reservation expired and the work had been sold');
    return { refunded: true };
  });
  if (outcome.order) {
    await sendEmail({ to: outcome.order.email, ...templates.orderConfirmed({ order: outcome.order }) });
    await notify(outcome.order.user, { type: 'order', title: 'Acquisition confirmed', message: `Order ${outcome.order.number} is confirmed.`, link: `/account/orders/${outcome.order.number}`, email: false });
  }
  return outcome;
}

export async function refundOrder(order, note = 'Refund issued') {
  const provider = paymentProvider(order.payment?.provider || undefined);
  const { refundId } = await provider.refund({ intentId: order.payment.intentId, paymentId: order.payment.chargeId, amount: order.total, currency: order.currency });
  await Order.updateOne({ _id: order._id }, { status: 'refunded', 'payment.status': 'refunded', 'payment.refundId': refundId, 'payment.refundedAt': new Date(), $push: { history: { status: 'refunded', note } } });
  await notify(order.user, { type: 'order', title: 'Refund issued', message: `A refund for order ${order.number} has been issued.`, link: `/account/orders/${order.number}` });
  return refundId;
}

export const ORDER_TRANSITIONS = {
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  pending_payment: ['cancelled'],
  payment_failed: ['cancelled'],
  cancelled: [],
  refunded: [],
};

export async function updateOrderStatus(order, status, { note, tracking } = {}) {
  if (!ORDER_TRANSITIONS[order.status]?.includes(status)) throw new AppError(409, `Cannot move an order from ${order.status} to ${status}`, 'INVALID_TRANSITION');
  if (status === 'cancelled' && ['pending_payment', 'payment_failed'].includes(order.status)) {
    await releaseOrder(order, 'cancelled', note || 'Cancelled by gallery');
    return Order.findById(order._id);
  }
  order.status = status;
  if (tracking) order.tracking = tracking;
  order.history.push({ status, note });
  await order.save();
  await sendEmail({ to: order.email, ...templates.orderStatus({ order }) });
  await notify(order.user, { type: 'order', title: `Order ${status}`, message: `Order ${order.number} is now ${status}.`, link: `/account/orders/${order.number}`, email: false });
  return order;
}

export async function expireHolds(now = new Date()) {
  const orders = await InventoryHold.distinct('order', { status: 'held', expiresAt: { $lt: now } });
  let count = 0;
  for (const id of orders) {
    const order = await Order.findById(id);
    if (order && ['pending_payment', 'payment_failed'].includes(order.status)) {
      await releaseOrder(order, 'cancelled', 'Reservation expired before payment');
      count++;
    }
  }
  return count;
}
