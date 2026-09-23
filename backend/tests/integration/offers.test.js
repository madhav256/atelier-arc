import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, stopDb, resetDb, makeUser, agentFor, makeArtwork, address } from './setup.js';
import { Inquiry, Order } from '../../src/models/index.js';

beforeAll(startDb, 120_000);
afterAll(stopDb);
beforeEach(resetDb);

async function setup() {
  const client = await makeUser();
  const staff = await makeUser('admin');
  const art = await makeArtwork({ price: 100000 });
  return { c: await agentFor(client), s: await agentFor(staff), art, client };
}

describe('make an offer', () => {
  it('validates the amount and prevents duplicate open offers', async () => {
    const { c, art } = await setup();
    const low = await c.post('/api/v1/me/offers').send({ artworkId: String(art._id), amount: 50000 }).expect(422);
    expect(low.body.error.code).toBe('OFFER_TOO_LOW');
    expect((await c.post('/api/v1/me/offers').send({ artworkId: String(art._id), amount: 100000 }).expect(422)).body.error.code).toBe('OFFER_AT_LIST');
    await c.post('/api/v1/me/offers').send({ artworkId: String(art._id), amount: 80000 }).expect(201);
    expect((await c.post('/api/v1/me/offers').send({ artworkId: String(art._id), amount: 85000 }).expect(409)).body.error.code).toBe('OFFER_EXISTS');
  });

  it('counter, revise, accept counter, then pay the agreed price through the private-offer checkout', async () => {
    const { c, s, art, client } = await setup();
    const created = await c.post('/api/v1/me/offers').send({ artworkId: String(art._id), amount: 70000, note: 'For our library' }).expect(201);
    const id = created.body.data._id;
    await s.post(`/api/v1/admin/inquiries/${id}/bid/counter`).send({ amount: 60000 }).expect(422);
    await s.post(`/api/v1/admin/inquiries/${id}/bid/counter`).send({ amount: 92000, note: 'The artist would accept 92,000.' }).expect(200);
    await c.post(`/api/v1/me/inquiries/${id}/bid/revise`).send({ amount: 85000 }).expect(200);
    await s.post(`/api/v1/admin/inquiries/${id}/bid/counter`).send({ amount: 90000 }).expect(200);
    const accepted = await c.post(`/api/v1/me/inquiries/${id}/bid/accept-counter`).expect(200);
    expect(accepted.body.data.bid.status).toBe('accepted');
    expect(accepted.body.data.offer).toMatchObject({ amount: 90000, status: 'open' });
    expect(accepted.body.data.bid.events.map((e) => e.action)).toEqual(['offered', 'countered', 'revised', 'countered', 'accepted']);
    const pay = await c.post(`/api/v1/me/inquiries/${id}/offer/accept`).send({ email: client.email, address, deliveryMethod: 'collect' }).expect(201);
    const order = await Order.findById(pay.body.data.order._id).lean();
    expect(order.items[0].unitPrice).toBe(90000);
  });

  it('staff accept opens a private offer; decline and withdraw close the offer', async () => {
    const { c, s, art } = await setup();
    const a = await c.post('/api/v1/me/offers').send({ artworkId: String(art._id), amount: 75000 }).expect(201);
    const acc = await s.post(`/api/v1/admin/inquiries/${a.body.data._id}/bid/accept`).send({}).expect(200);
    expect(acc.body.data.offer).toMatchObject({ amount: 75000, status: 'open' });
    await s.post(`/api/v1/admin/inquiries/${a.body.data._id}/bid/decline`).send({}).expect(409);

    const art2 = await makeArtwork({ price: 200000 });
    const b = await c.post('/api/v1/me/offers').send({ artworkId: String(art2._id), amount: 150000 }).expect(201);
    await s.post(`/api/v1/admin/inquiries/${b.body.data._id}/bid/decline`).send({ note: 'The artist is holding the price.' }).expect(200);
    expect((await Inquiry.findById(b.body.data._id).lean()).bid.status).toBe('declined');
    const art3 = await makeArtwork({ price: 200000 });
    const d = await c.post('/api/v1/me/offers').send({ artworkId: String(art3._id), amount: 150000 }).expect(201);
    await c.post(`/api/v1/me/inquiries/${d.body.data._id}/bid/withdraw`).expect(200);
    await s.post(`/api/v1/admin/inquiries/${d.body.data._id}/bid/accept`).send({}).expect(409);
  });

  it('rejects offers on price-on-request works', async () => {
    const { c } = await setup();
    const por = await makeArtwork({ price: null, priceOnRequest: true });
    expect((await c.post('/api/v1/me/offers').send({ artworkId: String(por._id), amount: 1000 }).expect(422)).body.error.code).toBe('PRICE_ON_REQUEST');
  });
});
