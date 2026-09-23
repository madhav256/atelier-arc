import { env } from '../../config/env.js';

// Whether monthly instalments can be offered for an order, and on which tenures.
// The bank sets the interest and the final plan inside the gateway's own window,
// so we only ever show the principal split, never an invented rate.
export function emiOptions(provider, order) {
  const { enabled, minAmount, tenures } = env.payments.emi;
  const available = Boolean(enabled && provider.supportsEmi && order.currency === 'INR' && order.total >= minAmount && tenures.length);
  if (!available) return { available: false };
  return {
    available: true,
    minAmount,
    tenures: tenures.map((months) => ({ months, principalPerMonth: Math.ceil(order.total / months) })),
  };
}
