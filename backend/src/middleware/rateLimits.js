import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    // Test mode keeps a high ceiling so e2e suites never trip it; RATE_LIMIT_TEST_CEILING raises it further for load tests.
    limit: env.isTest ? Number(process.env.RATE_LIMIT_TEST_CEILING || 10_000) : limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message, requestId: req.id } }),
  });

export const apiLimiter = make(60_000, 300, 'Too many requests. Please slow down.');
export const authLimiter = make(15 * 60_000, 30, 'Too many sign-in attempts. Try again in a few minutes.');
export const inquiryLimiter = make(60 * 60_000, 20, 'Too many inquiries from this network. Please try later or call the gallery.');
export const uploadLimiter = make(60_000, 30, 'Too many uploads. Please wait a moment.');
