import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { mockProvider } from './mock.js';
import { stripeProvider } from './stripe.js';
import { razorpayProvider } from './razorpay.js';

const providers = { mock: mockProvider, stripe: stripeProvider, razorpay: razorpayProvider };

export function paymentProvider(name = env.payments.provider) {
  const provider = providers[name];
  if (!provider) throw new AppError(500, `Unknown payment provider ${name}`, 'CONFIG_ERROR');
  return provider;
}

export function providerByName(name) {
  const provider = providers[name];
  if (!provider) throw new AppError(404, 'Unknown payment provider', 'NOT_FOUND');
  return provider;
}
