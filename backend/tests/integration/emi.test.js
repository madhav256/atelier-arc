import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { Order } from '../../src/models/index.js';
import { emiOptions } from '../../src/providers/payments/emi.js';
import { mockProvider } from '../../src/providers/payments/mock.js';
import { stripeProvider } from '../../src/providers/payments/stripe.js';
import { startDb, stopDb, resetDb, agentFor, makeArtwork, address } from './setup.js';

beforeAll(startDb, 120_000);
afterAll(stopDb);
beforeEach(resetDb);

describe('EMI at checkout', () => {
  it('offers instalments only on INR orders above the minimum, through providers that support it', () => {
    const order = { total: 120000, currency: 'INR' };
    const emi = emiOptions(mockProvider, order);
    expect(emi.available).toBe(true);
    expect(emi.tenures.map((t) => t.months)).toEqual([3, 6, 9, 12]);
    expect(emi.tenures[1].principalPerMonth).toBe(20000);
    expect(emiOptions(mockProvider, { total: 4000, currency: 'INR' }).available).toBe(false);
    expect(emiOptions(mockProvider, { total: 120000, currency: 'USD' }).available).toBe(false);
    expect(emiOptions(stripeProvider, order).available).toBe(false);
  });

  it('returns the plan with the payment and records an instalment payment on the order', async () => {
    const art = await makeArtwork();
    const c = await agentFor();
    await c.post('/api/v1/cart/items').send({ artworkId: String(art._id) }).expect(200);
    const quote = await c.post('/api/v1/checkout/quote').send({ address, deliveryMethod: 'insured_courier' }).expect(200);
    const placed = await c.post('/api/v1/checkout/orders').send({ email: 'emi@example.com', address, deliveryMethod: 'insured_courier', quoteToken: quote.body.data.quoteToken }).expect(201);
    const { order, payment } = placed.body.data;
    expect(payment.emi.available).toBe(true);
    await request(app).post('/api/v1/payments/mock/complete').send({ intentId: order.payment.intentId, method: 'emi', tenure: 7 }).expect(422);
    await request(app).post('/api/v1/payments/mock/complete').send({ intentId: order.payment.intentId, method: 'emi', tenure: 6 }).expect(200);
    const saved = await Order.findById(order._id).lean();
    expect(saved).toMatchObject({ status: 'confirmed', payment: { method: 'emi', emiTenure: 6 } });
    const lookup = await request(app).get(`/api/v1/orders/lookup?number=${order.number}&email=emi@example.com`).expect(200);
    expect(lookup.body.data.payment).toEqual({ method: 'emi', emiTenure: 6 });
  });
});
