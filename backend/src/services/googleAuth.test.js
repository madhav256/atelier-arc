import { describe, it, expect } from 'vitest';
import { validateGoogleClaims } from './googleAuth.js';

const valid = {
  iss: 'https://accounts.google.com',
  aud: 'client-123',
  sub: 'g-1',
  email: 'Collector@Example.com',
  email_verified: 'true',
  name: 'Test Collector',
  exp: String(Math.floor(Date.now() / 1000) + 600),
};

describe('google sign-in claim validation', () => {
  it('accepts a valid token and normalizes the identity', () => {
    expect(validateGoogleClaims(valid, 'client-123')).toEqual({
      googleId: 'g-1',
      email: 'collector@example.com',
      name: 'Test Collector',
    });
  });

  it('rejects a token minted for a different client', () => {
    expect(() => validateGoogleClaims({ ...valid, aud: 'someone-else' }, 'client-123')).toThrow();
  });

  it('rejects expired tokens and unverified emails', () => {
    expect(() => validateGoogleClaims({ ...valid, exp: '100' }, 'client-123')).toThrow();
    expect(() => validateGoogleClaims({ ...valid, email_verified: 'false' }, 'client-123')).toThrow();
  });

  it('rejects a foreign issuer and missing configuration', () => {
    expect(() => validateGoogleClaims({ ...valid, iss: 'https://evil.example' }, 'client-123')).toThrow();
    expect(() => validateGoogleClaims(valid, '')).toThrow();
  });
});
