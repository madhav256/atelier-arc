import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { buildGlb } from '../../src/services/modelService.js';
import { startDb, stopDb, resetDb, makeArtwork } from './setup.js';

beforeAll(startDb, 120_000);
afterAll(stopDb);
beforeEach(resetDb);

const binary = (res, cb) => {
  const chunks = [];
  res.on('data', (c) => chunks.push(c));
  res.on('end', () => cb(null, Buffer.concat(chunks)));
};

describe('AR model', () => {
  it('builds a valid GLB container at true scale', () => {
    const glb = buildGlb({ width: 0.9, height: 1.08, depth: 0.02, texture: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) });
    expect(glb.subarray(0, 4).toString()).toBe('glTF');
    expect(glb.readUInt32LE(4)).toBe(2);
    expect(glb.readUInt32LE(8)).toBe(glb.length);
    const jsonLen = glb.readUInt32LE(12);
    const json = JSON.parse(glb.subarray(20, 20 + jsonLen).toString());
    const pos = json.accessors[json.meshes[0].primitives[0].attributes.POSITION];
    expect(pos.max[0] - pos.min[0]).toBeCloseTo(0.9);
    expect(pos.max[1] - pos.min[1]).toBeCloseTo(1.08);
  });

  it('serves a model for a wall work and none for sculpture', async () => {
    const flat = await makeArtwork({ category: 'Paintings', dimensions: { width: 90, height: 108, depth: 2, unit: 'cm' }, images: [{ url: '/art/work-04.jpg', alt: 'x' }] });
    const res = await request(app).get(`/api/v1/artworks/${flat.slug}/model.glb`).buffer(true).parse(binary).expect(200);
    expect(res.headers['content-type']).toMatch(/model\/gltf-binary/);
    expect(res.body.subarray(0, 4).toString()).toBe('glTF');
    const sculpture = await makeArtwork({ category: 'Sculptures', dimensions: { width: 30, height: 40, depth: 30, unit: 'cm' } });
    expect((await request(app).get(`/api/v1/artworks/${sculpture.slug}/model.glb`).expect(404)).body.error.code).toBe('NO_MODEL');
  });
});
