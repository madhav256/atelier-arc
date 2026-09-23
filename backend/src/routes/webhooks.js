import { Router } from 'express';
import express from 'express';
import crypto from 'crypto';
import { asyncHandler, AppError } from '../lib/errors.js';
import { ok } from '../lib/util.js';
import { handleWebhook } from '../services/paymentService.js';
import { mockProvider } from '../providers/payments/mock.js';
import { env } from '../config/env.js';
import { optionalAuth } from '../middleware/auth.js';
import { Order } from '../models/index.js';

const r = Router();

// Raw body is required for signature verification, so this router is mounted before express.json().
r.post('/webhooks/:provider(mock|stripe|razorpay)', express.raw({ type: '*/*', limit: '1mb' }), asyncHandler(async (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  const result = await handleWebhook(req.params.provider, raw, req.headers);
  res.json({ received: true, ...result });
}));

// Local-only helper standing in for the hosted payment page: it sends a correctly signed
// mock webhook through the same pipeline a real provider would.
r.post('/payments/mock/complete', express.json(), optionalAuth, asyncHandler(async (req, res) => {
  if (env.isProd || env.payments.provider !== 'mock') throw new AppError(404, 'Resource not found', 'NOT_FOUND');
  const { intentId, outcome = 'succeeded' } = req.body || {};
  const order = await Order.findOne({ 'payment.intentId': intentId }).lean();
  if (!order) throw new AppError(404, 'Payment not found', 'NOT_FOUND');
  const body = JSON.stringify({ id: `evt_${crypto.randomUUID()}`, type: outcome === 'failed' ? 'payment.failed' : 'payment.succeeded', intentId });
  const result = await handleWebhook('mock', body, { 'x-mock-signature': mockProvider.sign(body) });
  ok(res, { orderNumber: order.number, ...result, order: undefined });
}));

export default r;
