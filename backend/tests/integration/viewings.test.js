import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { outbox } from '../../src/providers/email/index.js';
import { slotTimes } from '../../src/services/viewingService.js';
import { startDb, stopDb, resetDb, makeUser, agentFor, makeArtwork } from './setup.js';

beforeAll(startDb, 120_000);
afterAll(stopDb);
beforeEach(resetDb);

describe('private viewings', () => {
  it('publishes Tuesday to Saturday slots in IST, at least a day ahead', () => {
    const now = new Date('2026-09-24T03:43:00+05:30'); // a Thursday
    const slots = slotTimes(now, 7);
    expect(slots[0].toISOString()).toBe('2026-09-25T05:30:00.000Z'); // Friday 11:00 IST
    const days = new Set(slots.map((d) => new Date(d.getTime() + 330 * 60e3).getUTCDay()));
    expect([...days].every((d) => d >= 2 && d <= 6)).toBe(true);
    expect(slots.every((d) => d.getTime() - now.getTime() >= 24 * 3600e3)).toBe(true);
  });

  it('books a slot, emails a confirmation with a calendar file, blocks double booking, and cancels', async () => {
    const creds = await makeUser();
    const c = await agentFor(creds);
    const art = await makeArtwork();
    const { body } = await request(app).get('/api/v1/viewings/slots?location=mumbai').expect(200);
    const slot = body.data.slots.find((s) => s.available).startsAt;
    const sent = outbox.length;
    const booked = await c.post('/api/v1/me/viewings').send({ location: 'mumbai', startsAt: slot, artworkId: String(art._id), notes: 'Would like to see it in daylight' }).expect(201);
    expect(booked.body.data).toMatchObject({ status: 'confirmed', location: 'mumbai' });
    expect(booked.body.data.reference).toMatch(/^VW-\d{5}$/);
    const mail = outbox.slice(sent).find((m) => m.to === creds.email);
    expect(mail.subject).toMatch(/private viewing/i);
    expect(mail.attachments[0].content).toContain('BEGIN:VEVENT');

    const other = await agentFor(await makeUser());
    expect((await other.post('/api/v1/me/viewings').send({ location: 'mumbai', startsAt: slot }).expect(409)).body.error.code).toBe('SLOT_TAKEN');
    await other.post('/api/v1/me/viewings').send({ location: 'virtual', startsAt: slot }).expect(201); // different room, same time
    const after = await request(app).get('/api/v1/viewings/slots?location=mumbai').expect(200);
    expect(after.body.data.slots.find((s) => s.startsAt === slot).available).toBe(false);
    await c.post('/api/v1/me/viewings').send({ location: 'mumbai', startsAt: '2026-01-01T05:30:00.000Z' }).expect(422);

    await c.post(`/api/v1/me/viewings/${booked.body.data._id}/cancel`).expect(200);
    await other.post('/api/v1/me/viewings').send({ location: 'mumbai', startsAt: slot }).expect(201);
  });

  it('staff see viewings and record the outcome', async () => {
    const c = await agentFor(await makeUser());
    const staff = await agentFor(await makeUser('advisor'));
    const { body } = await request(app).get('/api/v1/viewings/slots?location=new-delhi').expect(200);
    const v = await c.post('/api/v1/me/viewings').send({ location: 'new-delhi', startsAt: body.data.slots[0].startsAt }).expect(201);
    const list = await staff.get('/api/v1/admin/viewings?upcoming=true').expect(200);
    expect(list.body.data.map((x) => x._id)).toContain(v.body.data._id);
    await staff.post(`/api/v1/admin/viewings/${v.body.data._id}/status`).send({ status: 'completed' }).expect(200);
    await staff.post(`/api/v1/admin/viewings/${v.body.data._id}/status`).send({ status: 'cancelled' }).expect(409);
    await c.get('/api/v1/admin/viewings').expect(403);
  });
});
