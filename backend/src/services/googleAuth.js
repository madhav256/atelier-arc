import { AppError } from '../lib/errors.js';
import { env } from '../config/env.js';

const GOOGLE_TOKENINFO = 'https://oauth2.googleapis.com/tokeninfo';
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

// Pure claim check, kept separate from the network call so it stays unit-testable.
export function validateGoogleClaims(claims, clientId) {
  if (!clientId) throw new AppError(503, 'Google sign-in is not configured yet.', 'GOOGLE_NOT_CONFIGURED');
  const valid =
    claims &&
    GOOGLE_ISSUERS.includes(claims.iss) &&
    claims.aud === clientId &&
    Number(claims.exp) * 1000 > Date.now();
  if (!valid) throw new AppError(401, 'Google sign-in failed. Please try again.', 'INVALID_GOOGLE_TOKEN');
  const verified = claims.email_verified === true || claims.email_verified === 'true';
  if (!claims.email || !verified) throw new AppError(401, 'Google could not verify that email address.', 'UNVERIFIED_GOOGLE_EMAIL');
  return { googleId: claims.sub, email: String(claims.email).toLowerCase(), name: (claims.name || '').trim() };
}

export async function fetchGoogleClaims(credential) {
  let claims = null;
  try {
    const res = await fetch(`${GOOGLE_TOKENINFO}?id_token=${encodeURIComponent(credential)}`);
    if (res.ok) claims = await res.json();
  } catch {
    claims = null;
  }
  if (!claims) throw new AppError(401, 'Google sign-in failed. Please try again.', 'INVALID_GOOGLE_TOKEN');
  return claims;
}

export async function verifyGoogleCredential(credential) {
  const claims = await fetchGoogleClaims(credential);
  return validateGoogleClaims(claims, env.google.clientId);
}
