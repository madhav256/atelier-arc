import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, stopDb, resetDb, makeUser, agentFor, makeArtwork } from './setup.js';
import request from 'supertest';
import { app } from '../../src/app.js';
import { Order } from '../../src/models/index.js';

beforeAll(startDb, 120_000);
afterAll(stopDb);
beforeEach(resetDb);

const binary = (res, cb) => {
  const chunks = [];
  res.on('data', (c) => chunks.push(c));
  res.on('end', () => cb(null, Buffer.concat(chunks)));
};

describe('provenance dossier and certificate', () => {
  it('renders a public provenance PDF for a published work', async () => {
    const art = await makeArtwork({ provenance: ['Studio of the artist, 2024'] });
    const res = await request(app).get(`/api/v1/artworks/${art.slug}/provenance.pdf`).buffer(true).parse(binary).expect(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.body.subarray(0, 5).toString()).toBe('%PDF-');
    await request(app).get('/api/v1/artworks/not-a-work/provenance.pdf').expect(404);
  });

  it('issues a certificate only to the owner of a confirmed order, and it verifies', async () => {
    const owner = await makeUser();
    const other = await makeUser();
    const art = await makeArtwork();
    const order = await Order.create({
      number: 'AA-TEST-1', user: owner.user._id, email: owner.email, status: 'pending_payment', total: 1,
      items: [{ artwork: art._id, title: art.title, artistName: 'Test Artist', quantity: 1, unitPrice: 1 }],
      shippingAddress: { name: 'Asha Rao' },
    });
    const url = `/api/v1/me/orders/${order.number}/certificates/${art._id}`;
    const o = await agentFor(owner);
    await o.get(url).expect(404);
    await Order.updateOne({ _id: order._id }, { status: 'confirmed', 'payment.paidAt': new Date() });
    await (await agentFor(other)).get(url).expect(404);
    const pdf = await o.get(url).buffer(true).parse(binary).expect(200);
    expect(pdf.body.subarray(0, 5).toString()).toBe('%PDF-');
    const { certificateCode } = await import('../../src/services/documentService.js');
    const code = certificateCode(order.number, String(art._id));
    expect((await request(app).get(`/api/v1/certificates/${code}`).expect(200)).body.data).toMatchObject({ valid: true, title: art.title });
    expect((await request(app).get(`/api/v1/certificates/${order.number}.AAAAAAAAAA`).expect(200)).body.data.valid).toBe(false);
  });
});
