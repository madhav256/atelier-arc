// Content-based similarity between two artworks.
export function scoreArtwork(candidate, source) {
  let score = 0;
  if (candidate.artist?._id?.toString?.() === source.artist?._id?.toString?.() || candidate.artist?.toString() === source.artist?.toString()) score += 5;
  if (candidate.category === source.category) score += 3;
  if (candidate.medium === source.medium) score += 2;
  const tags = new Set(source.tags || []);
  score += (candidate.tags || []).filter((t) => tags.has(t)).length;
  return score;
}

// Builds a weighted taste profile from signals (saved, carted, viewed, stated preferences).
export function buildProfile(signals) {
  const profile = { artists: new Map(), categories: new Map(), mediums: new Map(), tags: new Map(), prices: [] };
  const bump = (map, key, weight) => key && map.set(String(key), (map.get(String(key)) || 0) + weight);
  for (const { artwork, weight } of signals) {
    if (!artwork) continue;
    bump(profile.artists, artwork.artist?._id || artwork.artist, weight * 3);
    bump(profile.categories, artwork.category, weight * 2);
    bump(profile.mediums, artwork.medium, weight);
    for (const tag of artwork.tags || []) bump(profile.tags, tag, weight * 0.5);
    if (artwork.price) profile.prices.push(artwork.price);
  }
  return profile;
}

export function scoreAgainstProfile(artwork, profile, preferences = {}) {
  let score = 0;
  score += profile.artists.get(String(artwork.artist?._id || artwork.artist)) || 0;
  score += profile.categories.get(artwork.category) || 0;
  score += profile.mediums.get(artwork.medium) || 0;
  for (const tag of artwork.tags || []) score += profile.tags.get(tag) || 0;
  if (preferences.categories?.includes(artwork.category)) score += 3;
  if (preferences.mediums?.includes(artwork.medium)) score += 2;
  if (preferences.artists?.some((id) => String(id) === String(artwork.artist?._id || artwork.artist))) score += 4;
  if (artwork.price && profile.prices.length) {
    const median = [...profile.prices].sort((a, b) => a - b)[Math.floor(profile.prices.length / 2)];
    const ratio = artwork.price / median;
    if (ratio > 0.5 && ratio < 2) score += 2;
  }
  if (preferences.priceMax && artwork.price > preferences.priceMax) score -= 5;
  if (preferences.priceMin && artwork.price && artwork.price < preferences.priceMin) score -= 2;
  score += Math.log10((artwork.saveCount || 0) + 1) * 0.5;
  return score;
}
