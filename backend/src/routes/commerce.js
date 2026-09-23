import { Router } from 'express';
import crypto from 'crypto';
import { asyncHandler, AppError } from '../lib/errors.js';
import { ok } from '../lib/util.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { inquiryLimiter } from '../middleware/rateLimits.js';
import { cart as cs, checkout as co, inquiry as is, objectId } from '../validation/schemas.js';
import { z } from 'zod';
import * as cart from '../services/cartService.js';
import { quoteCart, checkout } from '../services/orderService.js';
import { createInquiry } from '../services/inquiryService.js';
import { sharedCollection } from '../services/collectionService.js';
import { DELIVERY_METHODS } from '../providers/commerce/quotes.js';
import { Order } from '../models/index.js';
import { env } from '../config/env.js';

const r = Router();
r.use(optionalAuth);

// Guests get an opaque httpOnly cart session cookie.
function owner(req, res) {
  if (req.user) return { userId: req.user.sub };
  let sessionId = req.cookies.cartSession;
  if (!sessionId || !/^[a-f0-9]{32}$/.test(sessionId)) {
    sessionId = crypto.randomBytes(16).toString('hex');
    res.cookie('cartSession', sessionId, { httpOnly: true, sameSite: 'lax', secure: env.isProd, maxAge: 30 * 864e5, path: '/' });
  }
  return { sessionId };
}

r.get('/cart', asyncHandler(async (req, res) => ok(res, await cart.pricedCart(owner(req, res)))));
r.post('/cart/items', validate(cs.add), asyncHandler(async (req, res) => ok(res, await cart.addItem(owner(req, res), req.body.artworkId, req.body.quantity))));
r.patch('/cart/items/:artworkId', validate({ params: z.object({ artworkId: objectId }), body: cs.update }), asyncHandler(async (req, res) => ok(res, await cart.updateQuantity(owner(req, res), req.params.artworkId, req.body.quantity))));
r.delete('/cart/items/:artworkId', validate({ params: z.object({ artworkId: objectId }) }), asyncHandler(async (req, res) => ok(res, await cart.removeItem(owner(req, res), req.params.artworkId))));

r.get('/checkout/delivery-methods', (req, res) => ok(res, Object.entries(DELIVERY_METHODS).map(([id, m]) => ({ id, ...m }))));
r.post('/checkout/quote', validate(co.quote), asyncHandler(async (req, res) => ok(res, await quoteCart(owner(req, res), req.body))));
r.post('/checkout/orders', validate(co.order), asyncHandler(async (req, res) => {
  const email = req.user?.email || req.body.email;
  const out = await checkout(owner(req, res), { ...req.body, email });
  ok(res, { order: out.order, payment: out.payment }, undefined, 201);
}));
// Guest order status lookup requires both number and email.
r.get('/orders/lookup', asyncHandler(async (req, res) => {
  const { number, email } = req.query;
  if (!number || !email) throw new AppError(422, 'Order number and email are required', 'VALIDATION_ERROR');
  const order = await Order.findOne({ number: String(number), email: String(email).toLowerCase() }).select('number status items total currency createdAt tracking history deliveryMethod payment.method payment.emiTenure').lean();
  if (!order) throw new AppError(404, 'We could not find that order', 'NOT_FOUND');
  ok(res, order);
}));

r.post('/inquiries', inquiryLimiter, validate(is.create), asyncHandler(async (req, res) => {
  const { website: _honeypot, ...input } = req.body;
  const inquiry = await createInquiry(input, req.user?.sub);
  ok(res, { reference: inquiry.reference, status: inquiry.status }, undefined, 201);
}));

r.get('/shared/collections/:token', asyncHandler(async (req, res) => ok(res, await sharedCollection(req.params.token))));

export default r;
