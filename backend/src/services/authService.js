import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { AppError } from '../lib/errors.js';
import { hashToken, randomToken } from '../lib/util.js';
import { startSession, endAllSessions } from './tokenService.js';
import { sendEmail } from '../providers/email/index.js';
import { templates } from '../providers/email/templates.js';

const LOCK_AFTER = 8;
const LOCK_MINUTES = 15;
// Used to keep response time similar whether or not the account exists.
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5Q7Q3Hn2rRjzZq0p0p9p4pZ0w1s6kGm';

async function issueVerification(user) {
  const token = randomToken();
  await User.updateOne({ _id: user._id }, { verificationTokenHash: hashToken(token), verificationExpiresAt: new Date(Date.now() + 24 * 3600e3) });
  await sendEmail({ to: user.email, ...templates.verifyEmail({ name: user.name, token }) });
}

export async function register({ name, email, password }, userAgent) {
  if (await User.exists({ email: email.toLowerCase() })) throw new AppError(409, 'An account with that email already exists', 'EMAIL_EXISTS');
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  await issueVerification(user);
  const tokens = await startSession(user, userAgent);
  return { user, tokens };
}

export async function login({ email, password }, userAgent) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +failedLogins +lockedUntil');
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(423, 'Too many failed attempts. Try again in a few minutes or reset your password.', 'ACCOUNT_LOCKED');
  }
  const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !valid) {
    if (user) {
      const failed = (user.failedLogins || 0) + 1;
      await User.updateOne({ _id: user._id }, { failedLogins: failed, ...(failed >= LOCK_AFTER && { lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60e3), failedLogins: 0 }) });
    }
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }
  if (user.disabled) throw new AppError(403, 'This account is disabled. Contact the gallery.', 'ACCOUNT_DISABLED');
  await User.updateOne({ _id: user._id }, { failedLogins: 0, $unset: { lockedUntil: 1 } });
  const tokens = await startSession(user, userAgent);
  return { user, tokens };
}

export async function resendVerification(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'Account not found', 'NOT_FOUND');
  if (user.verified) return;
  await issueVerification(user);
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return;
  const token = randomToken();
  await User.updateOne({ _id: user._id }, { passwordResetTokenHash: hashToken(token), passwordResetExpiresAt: new Date(Date.now() + 30 * 60e3) });
  await sendEmail({ to: user.email, ...templates.resetPassword({ name: user.name, token }) });
}

export async function resetPassword(token, password) {
  const user = await User.findOneAndUpdate(
    { passwordResetTokenHash: hashToken(token), passwordResetExpiresAt: { $gt: new Date() } },
    { passwordHash: await bcrypt.hash(password, 12), $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1, lockedUntil: 1 }, failedLogins: 0 },
  );
  if (!user) throw new AppError(400, 'This reset link is invalid or has expired', 'INVALID_RESET_TOKEN');
  await endAllSessions(user._id);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw new AppError(400, 'Current password is incorrect', 'INVALID_PASSWORD');
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  await endAllSessions(user._id);
}

export async function verifyEmail(token) {
  const user = await User.findOneAndUpdate(
    { verificationTokenHash: hashToken(token), verificationExpiresAt: { $gt: new Date() } },
    { verified: true, $unset: { verificationTokenHash: 1, verificationExpiresAt: 1 } },
    { new: true },
  );
  if (!user) throw new AppError(400, 'This verification link is invalid or has expired', 'INVALID_VERIFICATION_TOKEN');
  return user;
}
