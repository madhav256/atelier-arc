import { env } from '../../config/env.js';
import { hmac, safeEqual } from '../../lib/util.js';
import { AppError } from '../../lib/errors.js';

// Rule-based shipping, insurance and tax. Replace with a carrier/tax API adapter
// exposing the same quote() signature when an account is available.
export const DELIVERY_METHODS = {
  insured_courier: { label: 'Insured specialist courier', days: '5-8 business days', domestic: 4500, international: 18000, perKg: 0 },
  white_glove: { label: 'White-glove delivery and installation', days: '7-12 business days', domestic: 18000, international: 65000, perKg: 0 },
  collect: { label: 'Collect from the gallery', days: 'By appointment', domestic: 0, international: null, perKg: 0 },
};

const COUNTRY = /^[A-Z]{2}$/;

export function validateAddress(address = {}) {
  const errors = {};
  if (!address.name || address.name.trim().length < 2) errors.name = 'Enter the recipient name';
  if (!address.line1 || address.line1.trim().length < 4) errors.line1 = 'Enter a street address';
  if (!address.city) errors.city = 'Enter a city';
  if (!address.country || !COUNTRY.test(address.country)) errors.country = 'Choose a country';
  if (address.country === 'IN' && !/^[1-9][0-9]{5}$/.test(address.postalCode || '')) errors.postalCode = 'Enter a 6-digit PIN code';
  if (address.country === 'US' && !/^\d{5}(-\d{4})?$/.test(address.postalCode || '')) errors.postalCode = 'Enter a ZIP code';
  if (address.country === 'GB' && !/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(address.postalCode || '')) errors.postalCode = 'Enter a postcode';
  if (!address.postalCode) errors.postalCode ??= 'Enter a postal code';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function computeQuote({ subtotal, address, deliveryMethod, currency = 'INR' }) {
  const method = DELIVERY_METHODS[deliveryMethod];
  if (!method) throw new AppError(422, 'Choose a delivery method', 'INVALID_DELIVERY');
  const domestic = address.country === env.commerce.originCountry;
  const shipping = domestic ? method.domestic : method.international;
  if (shipping == null) throw new AppError(422, `${method.label} is not available for this destination`, 'DELIVERY_UNAVAILABLE');
  const insurance = deliveryMethod === 'collect' ? 0 : Math.round(subtotal * env.commerce.insuranceRate);
  // Domestic sales carry GST. International shipments are zero-rated exports; import duties are paid by the buyer.
  const tax = domestic ? Math.round(subtotal * env.commerce.domesticTaxRate) : 0;
  return { subtotal, shipping, insurance, tax, total: subtotal + shipping + insurance + tax, currency, domestic, deliveryMethod, estimate: method.days };
}

const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

export function signQuote(quote, context, ttlMinutes = 30) {
  const payload = { ...quote, ...context, exp: Date.now() + ttlMinutes * 60_000 };
  const body = encode(payload);
  return { token: `${body}.${hmac(env.quoteSecret, body)}`, expiresAt: new Date(payload.exp) };
}

export function verifyQuote(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig || !safeEqual(sig, hmac(env.quoteSecret, body))) throw new AppError(400, 'Quote is invalid. Please review your order again.', 'INVALID_QUOTE');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp < Date.now()) throw new AppError(409, 'Your quote expired. Please review the latest total.', 'QUOTE_EXPIRED');
  return payload;
}
