// Price bands behind the "Browse by price" tiles on the home page.
// The tile order in Home.jsx (PriceStory) must match this array - each tile
// links to /artworks?price=<index> and the catalog translates it via applyPriceParam.
export const PRICE_TILE_BANDS = [
  { min: '', max: '50000' }, // 01 Under ₹50,000
  { min: '50000', max: '100000' }, // 02 ₹50,000 – ₹1L
  { min: '100000', max: '500000' }, // 03 ₹1L – ₹5L
  { min: '500000', max: '1000000' }, // 04 ₹5L – ₹10L
  { min: '1000000', max: '' }, // 05 ₹10L+
];

export function bandForPriceParam(value) {
  if (value === null || value === undefined || value === '') return null;
  const i = Number(value);
  if (!Number.isInteger(i) || i < 0 || i >= PRICE_TILE_BANDS.length) return null;
  return PRICE_TILE_BANDS[i];
}

// Translates a ?price=<tile index> param into the min/max price params the
// artworks API understands. Unknown or missing values are dropped, everything
// else in the query string is preserved.
export function applyPriceParam(params) {
  const band = bandForPriceParam(params.get('price'));
  const out = new URLSearchParams(params);
  out.delete('price');
  if (band) {
    if (band.min) out.set('minPrice', band.min);
    if (band.max) out.set('maxPrice', band.max);
  }
  return out;
}
