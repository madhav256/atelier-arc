import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { AppError } from '../lib/errors.js';
import { hashToken, randomToken } from '../lib/util.js';

export { hashToken, randomToken };

export const MAX_SESSIONS = 5;

export function signTokens(user) {
  const sid = crypto.randomUUID();
  return {
    accessToken: jwt.sign({ sub: String(user._id || user.id), role: user.role, email: user.email }, env.accessSecret, { expiresIn: '15m' }),
    refreshToken: jwt.sign({ sub: String(user._id || user.id), sid }, env.refreshSecret, { expiresIn: '7d' }),
  };
}

export async function startSession(user, userAgent) {
  const tokens = signTokens(user);
  const entry = { tokenHash: hashToken(tokens.refreshToken), userAgent: userAgent?.slice(0, 200), createdAt: new Date(), lastUsedAt: new Date() };
  await User.updateOne({ _id: user._id }, { $push: { sessions: { $each: [entry], $slice: -MAX_SESSIONS } } });
  return tokens;
}

// Single-use refresh rotation. Presenting a token that was already rotated revokes every session.
export async function rotateRefresh(raw, userAgent) {
  let payload;
  try {
    payload = jwt.verify(raw, env.refreshSecret);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }
  const user = await User.findById(payload.sub).select('+sessions');
  if (!user || user.disabled) throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  const tokenHash = hashToken(raw);
  const next = signTokens(user);
  const updated = await User.updateOne(
    { _id: user._id, 'sessions.tokenHash': tokenHash },
    { $set: { 'sessions.$.tokenHash': hashToken(next.refreshToken), 'sessions.$.lastUsedAt': new Date(), 'sessions.$.userAgent': userAgent?.slice(0, 200) } },
  );
  if (!updated.modifiedCount) {
    await User.updateOne({ _id: user._id }, { $set: { sessions: [] } });
    throw new AppError(401, 'Session expired. Please sign in again.', 'REFRESH_REUSE');
  }
  return { user, tokens: next };
}

export async function endSession(raw) {
  try {
    const payload = jwt.verify(raw, env.refreshSecret, { ignoreExpiration: true });
    await User.updateOne({ _id: payload.sub }, { $pull: { sessions: { tokenHash: hashToken(raw) } } });
  } catch {
    /* already invalid */
  }
}

export const endAllSessions = (userId) => User.updateOne({ _id: userId }, { $set: { sessions: [] } });
