// Builds a true-scale glTF binary (GLB) of a wall-hung work: a thin panel with the artwork
// image on the front face and a plain edge. model-viewer places it on a wall in WebXR or
// Scene Viewer, and converts it to USDZ on the fly for iOS Quick Look, so no paid 3D
// service or hand-made model is needed. Sculptural works are not modelled.
import sharp from 'sharp';
import { AppError } from '../lib/errors.js';
import { Artwork } from '../models/index.js';
import { loadImage } from './documentService.js';

export const NOT_MODELLED = ['Sculptures', 'Ceramics'];
const cache = new Map(); // slug:updatedAt -> Buffer, small LRU

const metres = (v, unit) => (Number(v) || 0) * (unit === 'in' ? 0.0254 : 0.01);

function panel(w, h, d) {
  const x = w / 2;
  const y = h / 2;
  const z = d; // back face sits on the wall plane (z = 0); the front faces +Z
  // Front face: its own primitive so it can carry the texture.
  const front = {
    pos: [-x, y, z, x, y, z, x, -y, z, -x, -y, z],
    nor: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    uv: [0, 0, 1, 0, 1, 1, 0, 1],
    idx: [0, 3, 2, 0, 2, 1],
  };
  const faces = [
    [[-x, y, 0], [x, y, 0], [x, y, z], [-x, y, z], [0, 1, 0]], // top
    [[-x, -y, z], [x, -y, z], [x, -y, 0], [-x, -y, 0], [0, -1, 0]], // bottom
    [[x, y, z], [x, y, 0], [x, -y, 0], [x, -y, z], [1, 0, 0]], // right
    [[-x, y, 0], [-x, y, z], [-x, -y, z], [-x, -y, 0], [-1, 0, 0]], // left
    [[x, y, 0], [-x, y, 0], [-x, -y, 0], [x, -y, 0], [0, 0, -1]], // back
  ];
  const edge = { pos: [], nor: [], idx: [] };
  faces.forEach((f, i) => {
    for (const v of f.slice(0, 4)) edge.pos.push(...v), edge.nor.push(...f[4]);
    const o = i * 4;
    edge.idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  // Winding check for the edge faces is not needed: the edge material is double-sided.
  return { front, edge };
}

function minMax(pos) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) (min[k] = Math.min(min[k], pos[i + k])), (max[k] = Math.max(max[k], pos[i + k]));
  return { min, max };
}

export function buildGlb({ width, height, depth, texture, title = 'Artwork' }) {
  const { front, edge } = panel(width, height, depth);
  const chunks = [];
  const views = [];
  const accessors = [];
  let offset = 0;
  const push = (buf, target) => {
    const pad = (4 - (buf.length % 4)) % 4;
    views.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, ...(target && { target }) });
    chunks.push(buf, Buffer.alloc(pad));
    offset += buf.length + pad;
    return views.length - 1;
  };
  const f32 = (arr, type, withBounds) => {
    const view = push(Buffer.from(new Float32Array(arr).buffer), 34962);
    accessors.push({ bufferView: view, componentType: 5126, count: arr.length / (type === 'VEC2' ? 2 : 3), type, ...(withBounds && minMax(arr)) });
    return accessors.length - 1;
  };
  const u16 = (arr) => {
    const view = push(Buffer.from(new Uint16Array(arr).buffer), 34963);
    accessors.push({ bufferView: view, componentType: 5123, count: arr.length, type: 'SCALAR' });
    return accessors.length - 1;
  };
  const fp = f32(front.pos, 'VEC3', true);
  const fn = f32(front.nor, 'VEC3');
  const fu = f32(front.uv, 'VEC2');
  const fi = u16(front.idx);
  const ep = f32(edge.pos, 'VEC3', true);
  const en = f32(edge.nor, 'VEC3');
  const ei = u16(edge.idx);
  const imgView = push(texture);
  const json = {
    asset: { version: '2.0', generator: 'Atelier Arc' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: title }],
    meshes: [{ name: title, primitives: [
      { attributes: { POSITION: fp, NORMAL: fn, TEXCOORD_0: fu }, indices: fi, material: 0 },
      { attributes: { POSITION: ep, NORMAL: en }, indices: ei, material: 1 },
    ] }],
    materials: [
      { name: 'Surface', pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 0.85 } },
      { name: 'Edge', doubleSided: true, pbrMetallicRoughness: { baseColorFactor: [0.93, 0.91, 0.87, 1], metallicFactor: 0, roughnessFactor: 0.9 } },
    ],
    textures: [{ source: 0, sampler: 0 }],
    samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }],
    images: [{ bufferView: imgView, mimeType: 'image/jpeg' }],
    bufferViews: views,
    accessors,
    buffers: [{ byteLength: offset }],
  };
  const bin = Buffer.concat(chunks);
  let jsonBuf = Buffer.from(JSON.stringify(json));
  jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
  const header = Buffer.alloc(12);
  header.write('glTF', 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + bin.length, 8);
  const chunkHead = (len, type) => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(len, 0);
    b.write(type, 4);
    return b;
  };
  return Buffer.concat([header, chunkHead(jsonBuf.length, 'JSON'), jsonBuf, chunkHead(bin.length, 'BIN\0'), bin]);
}

export async function artworkModel(slug) {
  const a = await Artwork.findOne({ slug, published: true }).select('title slug category dimensions images updatedAt').lean();
  if (!a) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  if (NOT_MODELLED.includes(a.category)) throw new AppError(404, 'Sculptural works are shown in the room view', 'NO_MODEL');
  const { width, height, depth, unit } = a.dimensions || {};
  if (!width || !height) throw new AppError(404, 'This work has no dimensions to model', 'NO_MODEL');
  const key = `${slug}:${a.updatedAt?.valueOf()}`;
  if (cache.has(key)) return cache.get(key);
  const img = await loadImage(a.images?.[0]?.url);
  if (!img) throw new AppError(404, 'This work has no image to model', 'NO_MODEL');
  // Texture: cover-crop to the work's true aspect so nothing stretches, max 2048 px, sRGB JPEG.
  const aspect = width / height;
  const tw = aspect >= 1 ? 2048 : Math.round(2048 * aspect);
  const th = aspect >= 1 ? Math.round(2048 / aspect) : 2048;
  const texture = await sharp(img).resize(tw, th, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
  const glb = buildGlb({ width: metres(width, unit), height: metres(height, unit), depth: Math.max(metres(depth, unit), 0.02), texture, title: a.title });
  cache.set(key, glb);
  if (cache.size > 40) cache.delete(cache.keys().next().value);
  return glb;
}
