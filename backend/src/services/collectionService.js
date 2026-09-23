import { UserCollection, Artwork } from '../models/index.js';
import { AppError } from '../lib/errors.js';
import { randomToken } from '../lib/util.js';

const populateItems = { path: 'items.artwork', select: 'title slug images price priceOnRequest currency availability medium year dimensions artist', populate: { path: 'artist', select: 'name slug' } };

export async function listCollections(userId) {
  const lists = await UserCollection.find({ user: userId }).populate(populateItems).sort({ createdAt: 1 }).lean();
  if (lists.length) return lists;
  const created = await UserCollection.create({ user: userId, name: 'My Collection' });
  return [created.toObject()];
}

async function owned(userId, id) {
  const list = await UserCollection.findOne({ _id: id, user: userId });
  if (!list) throw new AppError(404, 'Collection not found', 'NOT_FOUND');
  return list;
}

export const createCollection = (userId, data) => UserCollection.create({ ...data, user: userId });

export async function updateCollection(userId, id, data) {
  const list = await owned(userId, id);
  Object.assign(list, data);
  if (data.isPublic && !list.shareToken) list.shareToken = randomToken(12);
  await list.save();
  return list.populate(populateItems);
}

export async function deleteCollection(userId, id) {
  const list = await owned(userId, id);
  const artworkIds = list.items.map((i) => i.artwork);
  await list.deleteOne();
  if (artworkIds.length) await Artwork.updateMany({ _id: { $in: artworkIds }, saveCount: { $gt: 0 } }, { $inc: { saveCount: -1 } });
}

export async function addToCollection(userId, id, artworkId, note) {
  const artwork = await Artwork.exists({ _id: artworkId, published: true });
  if (!artwork) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  const res = await UserCollection.updateOne({ _id: id, user: userId, 'items.artwork': { $ne: artworkId } }, { $push: { items: { artwork: artworkId, note } } });
  if (!res.matchedCount) {
    await owned(userId, id);
  } else {
    await Artwork.updateOne({ _id: artworkId }, { $inc: { saveCount: 1 } });
  }
  return (await owned(userId, id)).populate(populateItems);
}

export async function updateItemNote(userId, id, artworkId, note) {
  const res = await UserCollection.updateOne({ _id: id, user: userId, 'items.artwork': artworkId }, { $set: { 'items.$.note': note } });
  if (!res.matchedCount) throw new AppError(404, 'Item not found', 'NOT_FOUND');
  return (await owned(userId, id)).populate(populateItems);
}

export async function removeFromCollection(userId, id, artworkId) {
  const res = await UserCollection.updateOne({ _id: id, user: userId, 'items.artwork': artworkId }, { $pull: { items: { artwork: artworkId } } });
  if (res.modifiedCount) await Artwork.updateOne({ _id: artworkId, saveCount: { $gt: 0 } }, { $inc: { saveCount: -1 } });
  return (await owned(userId, id)).populate(populateItems);
}

export async function sharedCollection(token) {
  const list = await UserCollection.findOne({ shareToken: token, isPublic: true }).populate(populateItems).populate('user', 'name').lean();
  if (!list) throw new AppError(404, 'This collection is private or no longer shared', 'NOT_FOUND');
  return { name: list.name, description: list.description, owner: list.user?.name?.split(' ')[0], items: list.items.filter((i) => i.artwork) };
}
