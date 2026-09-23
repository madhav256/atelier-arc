import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { asyncHandler, AppError } from '../lib/errors.js';
import { ok } from '../lib/util.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadLimiter } from '../middleware/rateLimits.js';
import { admin as as, inquiry as is, bid as bidSchemas, idParam, listQuery, objectId } from '../validation/schemas.js';
import * as adminService from '../services/adminService.js';
import * as inquiries from '../services/inquiryService.js';
import * as bids from '../services/bidService.js';
import { dashboard } from '../services/analyticsService.js';
import { updateOrderStatus, refundOrder, expireHolds } from '../services/orderService.js';
import { audit } from '../services/auditService.js';
import { storeImage, storeVideo, processImage } from '../providers/storage/index.js';
import * as viewingService from '../services/viewingService.js';
import { Order, User } from '../models/index.js';

const r = Router();
r.use(authenticate, authorize('admin', 'advisor'));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 1 } });

r.get('/analytics', authorize('admin'), asyncHandler(async (req, res) => ok(res, await dashboard(req.query))));
r.get('/audit', authorize('admin'), validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const out = await adminService.auditTrail({ resource: req.query.resource, resourceId: req.query.resourceId, page: req.query.page, limit: req.query.limit });
  ok(res, out.items, { total: out.total, page: out.page, limit: out.limit });
}));
r.get('/advisors', asyncHandler(async (req, res) => ok(res, await User.find({ role: { $in: ['advisor', 'admin'] }, disabled: { $ne: true } }).select('name email role').lean())));

r.post('/uploads', authorize('admin'), uploadLimiter, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(422, 'Choose an image to upload', 'NO_FILE');
  const image = await storeImage(req.file.buffer, { alt: String(req.body.alt || '').slice(0, 300) });
  await audit(req, { action: 'upload', resource: 'images', resourceId: image.url, changes: { width: image.width, height: image.height } });
  ok(res, image, undefined, 201);
}));

const filmUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 80 * 1024 * 1024, files: 2 } });
r.post('/uploads/video', authorize('admin'), uploadLimiter, filmUpload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), asyncHandler(async (req, res) => {
  const file = req.files?.video?.[0];
  if (!file) throw new AppError(422, 'Choose a film to upload', 'NO_FILE');
  const poster = req.files?.poster?.[0];
  if (poster) await processImage(poster.buffer); // same type and size checks as artwork images
  const video = await storeVideo(file.buffer, { poster: poster?.buffer, caption: String(req.body.caption || '').slice(0, 200) });
  await audit(req, { action: 'upload', resource: 'videos', resourceId: video.url, changes: { duration: video.duration, width: video.width, height: video.height } });
  ok(res, video, undefined, 201);
}));

r.get('/viewings', asyncHandler(async (req, res) => ok(res, await viewingService.list({ status: req.query.status ? String(req.query.status) : undefined, upcoming: req.query.upcoming === 'true' }))));
r.post('/viewings/:id/status', validate({ params: idParam, body: z.object({ status: z.enum(['completed', 'no_show', 'cancelled']), note: z.string().trim().max(500).optional() }) }), asyncHandler(async (req, res) => {
  const v = await viewingService.setStatus(req.params.id, req.body);
  await audit(req, { action: 'status', resource: 'viewings', resourceId: String(v._id), changes: { status: v.status } });
  ok(res, v);
}));

r.post('/maintenance/expire-holds', authorize('admin'), asyncHandler(async (req, res) => ok(res, { released: await expireHolds() })));

// Orders
r.post('/orders/:id/status', validate({ params: idParam, body: as.orderStatus }), asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, 'Order not found', 'NOT_FOUND');
  const before = order.status;
  const updated = await updateOrderStatus(order, req.body.status, req.body);
  await audit(req, { action: 'status', resource: 'orders', resourceId: order._id, changes: { status: { from: before, to: updated.status }, tracking: req.body.tracking } });
  ok(res, updated);
}));
r.post('/orders/:id/refund', authorize('admin'), validate({ params: idParam, body: as.refund }), asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, 'Order not found', 'NOT_FOUND');
  if (!['confirmed', 'preparing', 'shipped', 'delivered'].includes(order.status)) throw new AppError(409, 'Only paid orders can be refunded', 'INVALID_TRANSITION');
  const refundId = await refundOrder(order, req.body.note);
  await audit(req, { action: 'refund', resource: 'orders', resourceId: order._id, changes: { refundId, amount: order.total } });
  ok(res, await Order.findById(order._id));
}));

// Inquiry pipeline
const withAudit = (action, fn) => asyncHandler(async (req, res) => {
  const result = await fn(req);
  await audit(req, { action, resource: 'inquiries', resourceId: req.params.id, changes: req.body });
  ok(res, result);
});
r.get('/inquiries/:id', validate({ params: idParam }), asyncHandler(async (req, res) => ok(res, await inquiries.getStaffInquiry(req.user, req.params.id))));
r.post('/inquiries/:id/status', validate({ params: idParam, body: is.status }), withAudit('status', (req) => inquiries.changeStatus(req.user, req.params.id, req.body.status)));
r.post('/inquiries/:id/assign', authorize('admin'), validate({ params: idParam, body: is.assign }), withAudit('assign', (req) => inquiries.assign(req.user, req.params.id, req.body.advisorId)));
r.post('/inquiries/:id/notes', validate({ params: idParam, body: is.message }), withAudit('note', (req) => inquiries.addNote(req.user, req.params.id, req.body.text)));
r.post('/inquiries/:id/messages', validate({ params: idParam, body: is.message }), withAudit('reply', (req) => inquiries.staffReply(req.user, req.params.id, req.body.text)));
r.post('/inquiries/:id/appointments', validate({ params: idParam, body: is.appointment }), withAudit('appointment', (req) => inquiries.scheduleAppointment(req.user, req.params.id, req.body)));
r.post('/inquiries/:id/offer', validate({ params: idParam, body: is.offer }), withAudit('offer', (req) => inquiries.makeOffer(req.user, req.params.id, req.body)));
r.post('/inquiries/:id/bid/accept', validate({ params: idParam, body: bidSchemas.note }), withAudit('bid:accept', (req) => bids.staffAccept(req.user, req.params.id, req.body)));
r.post('/inquiries/:id/bid/counter', validate({ params: idParam, body: bidSchemas.amount }), withAudit('bid:counter', (req) => bids.staffCounter(req.user, req.params.id, req.body)));
r.post('/inquiries/:id/bid/decline', validate({ params: idParam, body: bidSchemas.note }), withAudit('bid:decline', (req) => bids.staffDecline(req.user, req.params.id, req.body)));
r.delete('/inquiries/:id/offer', validate({ params: idParam }), withAudit('offer:withdraw', (req) => inquiries.withdrawOffer(req.user, req.params.id)));

// Generic resource CRUD
const RES = ':resource(artworks|artists|collections|articles|inquiries|orders|customers)';
r.get(`/${RES}`, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const out = await adminService.list(req.params.resource, req.user, req.query);
  ok(res, out.items, { total: out.total, page: out.page, limit: out.limit, pages: Math.ceil(out.total / out.limit) });
}));
r.get(`/${RES}/:id`, validate({ params: z.object({ resource: z.string(), id: objectId }) }), asyncHandler(async (req, res) => ok(res, await adminService.get(req.params.resource, req.user, req.params.id))));
r.post(`/${RES}`, asyncHandler(async (req, res) => ok(res, await adminService.create(req.params.resource, req), undefined, 201)));
r.post(`/${RES}/bulk`, validate({ body: z.object({ ids: z.array(objectId).min(1).max(200), action: z.string() }) }), asyncHandler(async (req, res) => ok(res, await adminService.bulk(req.params.resource, req, req.body))));
r.patch(`/${RES}/:id`, validate({ params: z.object({ resource: z.string(), id: objectId }) }), asyncHandler(async (req, res) => ok(res, await adminService.update(req.params.resource, req))));
r.delete(`/${RES}/:id`, validate({ params: z.object({ resource: z.string(), id: objectId }) }), asyncHandler(async (req, res) => {
  await adminService.remove(req.params.resource, req);
  res.status(204).end();
}));

export default r;
