import mongoose from 'mongoose';
import crypto from 'crypto';
import { Cart, Artwork } from '../models/index.js';
import { AppError } from '../lib/errors.js';

const ownerFilter = (owner) => (owner.userId ? { user: owner.userId } : { sessionId: owner.sessionId });

export async function getOrCreateCart(owner) {
  if (!owner.userId && !owner.sessionId) throw new AppError(400, 'No cart session', 'NO_CART');
  return (await Cart.findOne(ownerFilter(owner))) || Cart.create(owner.userId ? { user: owner.userId } : { sessionId: owner.sessionId });
}

export async function pricedCart(owner) {
  const cart = await Cart.findOne(ownerFilter(owner)).populate({ path: 'items.artwork', populate: { path: 'artist', select: 'name slug' } }).lean();
  const lines = (cart?.items || []).map((item) => {
    const a = item.artwork;
    const issue = !a || !a.published ? 'unavailable' : a.priceOnRequest || a.price == null ? 'price_on_request' : a.availability === 'sold' ? 'sold' : a.stock < item.quantity ? 'reserved' : null;
    return {
      artworkId: a?._id,
      slug: a?.slug,
      title: a?.title,
      artistName: a?.artist?.name,
      image: a?.images?.[0]?.url,
      medium: a?.medium,
      dimensions: a?.dimensions,
      quantity: item.quantity,
      unitPrice: a?.price ?? null,
      currency: a?.currency || 'INR',
      lineTotal: issue ? 0 : a.price * item.quantity,
      issue,
    };
  });
  const purchasable = lines.filter((l) => !l.issue);
  const subtotal = purchasable.reduce((sum, l) => sum + l.lineTotal, 0);
  const signature = crypto
    .createHash('sha256')
    .update(JSON.stringify(purchasable.map((l) => [String(l.artworkId), l.quantity, l.unitPrice])))
    .digest('hex');
  return { id: cart?._id, lines, subtotal, currency: 'INR', count: lines.length, purchasableCount: purchasable.length, hasIssues: lines.some((l) => l.issue), signature };
}

export async function addItem(owner, artworkId, quantity = 1) {
  if (!mongoose.isValidObjectId(artworkId)) throw new AppError(400, 'Invalid artwork', 'INVALID_ID');
  const artwork = await Artwork.findOne({ _id: artworkId, published: true }).lean();
  if (!artwork) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  if (artwork.priceOnRequest || artwork.price == null) throw new AppError(409, 'This work is offered by private inquiry', 'PRICE_ON_REQUEST');
  if (artwork.availability === 'sold' || artwork.stock < 1) throw new AppError(409, 'This work is no longer available', 'ARTWORK_UNAVAILABLE');
  const cart = await getOrCreateCart(owner);
  const existing = cart.items.find((i) => String(i.artwork) === String(artworkId));
  const nextQty = Math.min(artwork.stock, existing ? existing.quantity + (artwork.stock > 1 ? quantity : 0) : quantity);
  if (existing) existing.quantity = Math.max(1, nextQty);
  else cart.items.push({ artwork: artworkId, quantity: Math.max(1, nextQty) });
  await cart.save();
  return pricedCart(owner);
}

export async function updateQuantity(owner, artworkId, quantity) {
  const cart = await getOrCreateCart(owner);
  const item = cart.items.find((i) => String(i.artwork) === String(artworkId));
  if (!item) throw new AppError(404, 'Item not in cart', 'NOT_FOUND');
  const artwork = await Artwork.findById(artworkId).lean();
  item.quantity = Math.max(1, Math.min(quantity, artwork?.stock || 1));
  await cart.save();
  return pricedCart(owner);
}

export async function removeItem(owner, artworkId) {
  await Cart.updateOne(ownerFilter(owner), { $pull: { items: { artwork: artworkId } } });
  return pricedCart(owner);
}

export const clearCart = (owner, session) => Cart.updateOne(ownerFilter(owner), { $set: { items: [] } }, { session });

// Moves a guest cart into the signed-in user's cart without duplicating works.
export async function mergeGuestCart(sessionId, userId) {
  if (!sessionId || !userId) return;
  const guest = await Cart.findOne({ sessionId });
  if (!guest?.items.length) return;
  const cart = await getOrCreateCart({ userId });
  for (const item of guest.items) {
    if (!cart.items.some((i) => String(i.artwork) === String(item.artwork))) cart.items.push({ artwork: item.artwork, quantity: item.quantity });
  }
  await cart.save();
  await Cart.deleteOne({ _id: guest._id });
}
