import { Router } from 'express';
import { asyncHandler, AppError } from '../lib/errors.js';
import { ok } from '../lib/util.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimits.js';
import { auth as s } from '../validation/schemas.js';
import * as authService from '../services/authService.js';
import { rotateRefresh, endSession, endAllSessions } from '../services/tokenService.js';
import { mergeGuestCart } from '../services/cartService.js';
import { env } from '../config/env.js';
import { User } from '../models/index.js';

const r = Router();
const base = { httpOnly: true, sameSite: 'lax', secure: env.isProd };

function setSession(res, tokens) {
  res.cookie('accessToken', tokens.accessToken, { ...base, maxAge: 15 * 60e3, path: '/' });
  res.cookie('refreshToken', tokens.refreshToken, { ...base, sameSite: 'strict', maxAge: 7 * 864e5, path: '/api/v1/auth' });
}
function clearSession(res) {
  res.clearCookie('accessToken', { ...base, path: '/' });
  res.clearCookie('refreshToken', { ...base, sameSite: 'strict', path: '/api/v1/auth' });
}

r.use(authLimiter);
r.get('/csrf', (req, res) => ok(res, { csrfToken: req.cookies.csrfToken || null }));

r.post('/register', validate(s.register), asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body, req.get('user-agent'));
  setSession(res, tokens);
  await mergeGuestCart(req.cookies.cartSession, user._id);
  ok(res, { user, accessToken: tokens.accessToken }, undefined, 201);
}));

r.post('/login', validate(s.login), asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body, req.get('user-agent'));
  setSession(res, tokens);
  await mergeGuestCart(req.cookies.cartSession, user._id);
  ok(res, { user, accessToken: tokens.accessToken });
}));

r.post('/refresh', asyncHandler(async (req, res) => {
  const raw = req.cookies.refreshToken || req.body?.refreshToken;
  if (!raw) throw new AppError(401, 'Refresh token required', 'AUTH_REQUIRED');
  try {
    const { user, tokens } = await rotateRefresh(raw, req.get('user-agent'));
    setSession(res, tokens);
    ok(res, { user, accessToken: tokens.accessToken });
  } catch (err) {
    clearSession(res);
    throw err;
  }
}));

r.post('/logout', asyncHandler(async (req, res) => {
  if (req.cookies.refreshToken) await endSession(req.cookies.refreshToken);
  clearSession(res);
  res.status(204).end();
}));

r.post('/logout-all', authenticate, asyncHandler(async (req, res) => {
  await endAllSessions(req.user.sub);
  clearSession(res);
  res.status(204).end();
}));

r.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) throw new AppError(401, 'Account not found', 'AUTH_REQUIRED');
  ok(res, { user });
}));

const generic = { message: 'If an account exists for that email, we have sent instructions.' };
r.post('/forgot-password', validate(s.email), asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  ok(res, generic);
}));
r.post('/reset-password', validate(s.reset), asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  clearSession(res);
  ok(res, { message: 'Password updated. Please sign in again.' });
}));
r.post('/verify-email', validate(s.verify), asyncHandler(async (req, res) => ok(res, { user: await authService.verifyEmail(req.body.token) })));
r.post('/resend-verification', authenticate, asyncHandler(async (req, res) => {
  await authService.resendVerification(req.user.sub);
  ok(res, { message: 'Verification email sent.' });
}));
r.post('/change-password', authenticate, validate(s.change), asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.sub, req.body.currentPassword, req.body.newPassword);
  clearSession(res);
  ok(res, { message: 'Password changed. Please sign in again.' });
}));

export default r;
