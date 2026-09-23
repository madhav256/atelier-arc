import { Artwork, User, UserCollection, Cart, Order } from '../models/index.js';
import { buildProfile, scoreAgainstProfile, scoreArtwork } from '../lib/recommend.js';

const CARD_FIELDS = 'title slug artist images price priceOnRequest currency availability medium category year dimensions tags saveCount';

export async function similarTo(artwork, limit = 6) {
  const pool = await Artwork.find({
    _id: { $ne: artwork._id },
    published: true,
    availability: { $ne: 'sold' },
    $or: [{ artist: artwork.artist?._id || artwork.artist }, { category: artwork.category }, { medium: artwork.medium }, { tags: { $in: artwork.tags || [] } }],
  })
    .select(CARD_FIELDS)
    .populate('artist', 'name slug')
    .limit(60)
    .lean();
  return pool.sort((a, b) => scoreArtwork(b, artwork) - scoreArtwork(a, artwork)).slice(0, limit);
}

export async function trending(limit = 8) {
  return Artwork.find({ published: true, availability: 'available' })
    .select(CARD_FIELDS)
    .populate('artist', 'name slug')
    .sort({ saveCount: -1, viewCount: -1, inquiryCount: -1 })
    .limit(limit)
    .lean();
}

// Personal recommendations from saved works, cart, recent views, followed artists and stated preferences.
export async function forUser(userId, limit = 12) {
  const [user, collections, cart, orders] = await Promise.all([
    User.findById(userId).populate('recentlyViewed.artwork').lean(),
    UserCollection.find({ user: userId }).populate('items.artwork').lean(),
    Cart.findOne({ user: userId }).populate('items.artwork').lean(),
    Order.find({ user: userId, status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] } }).populate('items.artwork').lean(),
  ]);
  const signals = [
    ...collections.flatMap((c) => c.items.map((i) => ({ artwork: i.artwork, weight: 3 }))),
    ...(cart?.items || []).map((i) => ({ artwork: i.artwork, weight: 4 })),
    ...(user?.recentlyViewed || []).map((v) => ({ artwork: v.artwork, weight: 1 })),
    ...orders.flatMap((o) => o.items.map((i) => ({ artwork: i.artwork, weight: 2 }))),
  ].filter((s) => s.artwork);
  const exclude = new Set(signals.map((s) => String(s.artwork._id)));
  const preferences = { ...(user?.preferences || {}), artists: [...(user?.preferences?.artists || []), ...(user?.followedArtists || [])] };
  if (!signals.length && !preferences.categories?.length && !preferences.artists.length) {
    return { reason: 'popular', items: await trending(limit) };
  }
  const profile = buildProfile(signals);
  const pool = await Artwork.find({ published: true, availability: 'available', _id: { $nin: [...exclude] } })
    .select(CARD_FIELDS)
    .populate('artist', 'name slug')
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  const ranked = pool
    .map((a) => ({ a, s: scoreAgainstProfile(a, profile, preferences) }))
    .sort((x, y) => y.s - x.s);
  // Keep variety: at most three works per artist.
  const perArtist = new Map();
  const items = [];
  for (const { a } of ranked) {
    const key = String(a.artist?._id);
    if ((perArtist.get(key) || 0) >= 3) continue;
    perArtist.set(key, (perArtist.get(key) || 0) + 1);
    items.push(a);
    if (items.length >= limit) break;
  }
  return { reason: 'personal', items };
}

export async function recordView(userId, artworkId) {
  if (!userId) return;
  await User.updateOne({ _id: userId }, { $pull: { recentlyViewed: { artwork: artworkId } } });
  await User.updateOne({ _id: userId }, { $push: { recentlyViewed: { $each: [{ artwork: artworkId, at: new Date() }], $slice: -30 } } });
}
