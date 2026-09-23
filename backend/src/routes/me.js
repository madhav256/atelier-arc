import { Router } from 'express';
import { asyncHandler, AppError } from '../lib/errors.js';
import { ok, pick } from '../lib/util.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profile, taste, bid, collection as cs, inquiry as is, checkout as co, idParam, objectId } from '../validation/schemas.js';
import { z } from 'zod';
import { User, Notification, Order, AvailabilityAlert, Artist, Artwork } from '../models/index.js';
import * as collections from '../services/collectionService.js';
import * as inquiries from '../services/inquiryService.js';
import * as bids from '../services/bidService.js';
import { forUser } from '../services/recommendationService.js';
import { checkoutOffer } from '../services/orderService.js';

const r = Router();
r.use(authenticate);

r.get('/profile', asyncHandler(async (req, res) => ok(res, await User.findById(req.user.sub).populate('followedArtists', 'name slug portrait'))));
r.patch('/profile', validate(profile), asyncHandler(async (req, res) => {
  const update = pick(req.body, ['name', 'phone', 'preferences', 'addresses']);
  if (req.body.notificationSettings) {
    const allowed = ['email', 'orders', 'inquiries', 'availability', 'recommendations', 'marketing'];
    for (const [k, v] of Object.entries(req.body.notificationSettings)) if (allowed.includes(k)) update[`notificationSettings.${k}`] = v;
  }
  ok(res, await User.findByIdAndUpdate(req.user.sub, { $set: update }, { new: true, runValidators: true }));
}));

// Taste quiz: writes stated preferences field by field so other preferences survive.
r.put('/taste', validate({ body: taste }), asyncHandler(async (req, res) => {
  const now = new Date();
  const update =
    req.body.action === 'skip'
      ? { $set: { 'tasteQuiz.skippedAt': now } }
      : {
          $set: {
            'preferences.styles': req.body.styles,
            'preferences.palettes': req.body.palettes,
            'tasteQuiz.completedAt': now,
            ...(req.body.scale ? { 'preferences.scale': req.body.scale } : {}),
            ...(req.body.priceMin != null ? { 'preferences.priceMin': req.body.priceMin } : {}),
            ...(req.body.priceMax != null ? { 'preferences.priceMax': req.body.priceMax } : {}),
          },
          $unset: {
            ...(req.body.scale ? {} : { 'preferences.scale': 1 }),
            ...(req.body.priceMin != null ? {} : { 'preferences.priceMin': 1 }),
            ...(req.body.priceMax != null ? {} : { 'preferences.priceMax': 1 }),
          },
        };
  const user = await User.findByIdAndUpdate(req.user.sub, update, { new: true, runValidators: true }).lean();
  ok(res, { preferences: user.preferences, tasteQuiz: user.tasteQuiz });
}));

// Collections
r.get('/collections', asyncHandler(async (req, res) => ok(res, await collections.listCollections(req.user.sub))));
r.post('/collections', validate(cs.create), asyncHandler(async (req, res) => ok(res, await collections.createCollection(req.user.sub, req.body), undefined, 201)));
r.patch('/collections/:id', validate({ params: idParam, body: cs.update }), asyncHandler(async (req, res) => ok(res, await collections.updateCollection(req.user.sub, req.params.id, req.body))));
r.delete('/collections/:id', validate({ params: idParam }), asyncHandler(async (req, res) => {
  await collections.deleteCollection(req.user.sub, req.params.id);
  res.status(204).end();
}));
r.post('/collections/:id/items', validate({ params: idParam, body: cs.item }), asyncHandler(async (req, res) => ok(res, await collections.addToCollection(req.user.sub, req.params.id, req.body.artworkId, req.body.note), undefined, 201)));
r.patch('/collections/:id/items/:artworkId', validate({ params: z.object({ id: objectId, artworkId: objectId }), body: cs.note }), asyncHandler(async (req, res) => ok(res, await collections.updateItemNote(req.user.sub, req.params.id, req.params.artworkId, req.body.note))));
r.delete('/collections/:id/items/:artworkId', validate({ params: z.object({ id: objectId, artworkId: objectId }) }), asyncHandler(async (req, res) => ok(res, await collections.removeFromCollection(req.user.sub, req.params.id, req.params.artworkId))));

// Notifications
r.get('/notifications', asyncHandler(async (req, res) => {
  const filter = { user: req.user.sub, ...(req.query.unread === 'true' && { readAt: null }) };
  const [items, unread] = await Promise.all([Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean(), Notification.countDocuments({ user: req.user.sub, readAt: null })]);
  ok(res, items, { unread });
}));
r.get('/notifications/unread-count', asyncHandler(async (req, res) => ok(res, { unread: await Notification.countDocuments({ user: req.user.sub, readAt: null }) })));
r.post('/notifications/:id/read', validate({ params: idParam }), asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, { readAt: new Date() }, { new: true });
  if (!n) throw new AppError(404, 'Notification not found', 'NOT_FOUND');
  ok(res, n);
}));
r.post('/notifications/read-all', asyncHandler(async (req, res) => {
  const out = await Notification.updateMany({ user: req.user.sub, readAt: null }, { readAt: new Date() });
  ok(res, { updated: out.modifiedCount });
}));
r.delete('/notifications/:id', validate({ params: idParam }), asyncHandler(async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user.sub });
  res.status(204).end();
}));

// Availability alerts and artist follows
r.get('/alerts', asyncHandler(async (req, res) => ok(res, await AvailabilityAlert.find({ user: req.user.sub }).populate('artwork', 'title slug availability images').lean())));
r.post('/alerts', validate(z.object({ artworkId: objectId })), asyncHandler(async (req, res) => {
  if (!(await Artwork.exists({ _id: req.body.artworkId, published: true }))) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  const alert = await AvailabilityAlert.findOneAndUpdate({ user: req.user.sub, artwork: req.body.artworkId }, { $setOnInsert: { user: req.user.sub, artwork: req.body.artworkId }, $unset: { notifiedAt: 1 } }, { upsert: true, new: true });
  ok(res, alert, undefined, 201);
}));
r.delete('/alerts/:id', validate({ params: idParam }), asyncHandler(async (req, res) => {
  await AvailabilityAlert.deleteOne({ _id: req.params.id, user: req.user.sub });
  res.status(204).end();
}));
r.post('/following/:id', validate({ params: idParam }), asyncHandler(async (req, res) => {
  if (!(await Artist.exists({ _id: req.params.id }))) throw new AppError(404, 'Artist not found', 'NOT_FOUND');
  await User.updateOne({ _id: req.user.sub }, { $addToSet: { followedArtists: req.params.id } });
  ok(res, { following: true });
}));
r.delete('/following/:id', validate({ params: idParam }), asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user.sub }, { $pull: { followedArtists: req.params.id } });
  ok(res, { following: false });
}));

r.get('/recommendations', asyncHandler(async (req, res) => {
  const out = await forUser(req.user.sub, Math.min(24, Number(req.query.limit) || 12));
  ok(res, out.items, { reason: out.reason });
}));

// Orders
r.get('/orders', asyncHandler(async (req, res) => ok(res, await Order.find({ user: req.user.sub }).sort({ createdAt: -1 }).select('-idempotencyKey').lean())));
r.get('/orders/:number', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ user: req.user.sub, number: req.params.number }).select('-idempotencyKey').lean();
  if (!order) throw new AppError(404, 'Order not found', 'NOT_FOUND');
  ok(res, order);
}));

// Inquiries (client view)
r.get('/inquiries', asyncHandler(async (req, res) => ok(res, await inquiries.clientInquiries(req.user.sub))));
r.get('/inquiries/:id', validate({ params: idParam }), asyncHandler(async (req, res) => ok(res, await inquiries.clientInquiry(req.user.sub, req.params.id))));
r.post('/inquiries/:id/messages', validate({ params: idParam, body: is.message }), asyncHandler(async (req, res) => ok(res, await inquiries.clientReply(req.user.sub, req.params.id, req.body.text))));
r.post('/inquiries/:id/appointments/:appointmentId', validate({ params: z.object({ id: objectId, appointmentId: objectId }), body: is.appointmentResponse }), asyncHandler(async (req, res) => ok(res, await inquiries.respondToAppointment(req.user.sub, req.params.id, req.params.appointmentId, req.body.status))));
// Collector offers on listed works
r.post('/offers', validate({ body: bid.create }), asyncHandler(async (req, res) => ok(res, await bids.createBid(req.user.sub, req.body), undefined, 201)));
r.post('/inquiries/:id/bid/accept-counter', validate({ params: idParam }), asyncHandler(async (req, res) => ok(res, await bids.clientAcceptCounter(req.user.sub, req.params.id))));
r.post('/inquiries/:id/bid/revise', validate({ params: idParam, body: bid.amount }), asyncHandler(async (req, res) => ok(res, await bids.clientRevise(req.user.sub, req.params.id, req.body))));
r.post('/inquiries/:id/bid/withdraw', validate({ params: idParam }), asyncHandler(async (req, res) => ok(res, await bids.clientWithdraw(req.user.sub, req.params.id))));
r.post('/inquiries/:id/offer/decline', validate({ params: idParam }), asyncHandler(async (req, res) => ok(res, await inquiries.declineOffer(req.user.sub, req.params.id))));
r.post('/inquiries/:id/offer/accept', validate({ params: idParam, body: co.offer }), asyncHandler(async (req, res) => ok(res, await checkoutOffer(req.user.sub, req.params.id, req.body), undefined, 201)));

export default r;
