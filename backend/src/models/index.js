import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const timestamps = { timestamps: true };
const ObjectId = Schema.Types.ObjectId;

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    width: Number,
    height: Number,
    variants: [{ url: String, width: Number, format: String }],
  },
  { _id: false },
);

const artistSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    portrait: String,
    biography: String,
    statement: String,
    nationality: String,
    location: String,
    birthYear: Number,
    movement: String,
    timeline: [{ year: Number, title: String, description: String }],
    exhibitions: [String],
    awards: [String],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
  },
  timestamps,
);
artistSchema.index({ name: 'text', movement: 'text', location: 'text' });

const artworkSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    artist: { type: ObjectId, ref: 'Artist', required: true, index: true },
    category: { type: String, index: true },
    medium: { type: String, index: true },
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
      unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
    },
    year: Number,
    edition: String,
    // Units that can still be sold. Originals are 1, editions can be more.
    stock: { type: Number, default: 1, min: 0 },
    price: { type: Number, index: true, min: 0 },
    currency: { type: String, default: 'INR' },
    priceOnRequest: { type: Boolean, default: false },
    availability: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
      index: true,
    },
    description: String,
    provenance: [String],
    exhibitionHistory: [String],
    condition: String,
    certificate: String,
    shipping: String,
    images: [imageSchema],
    collection: { type: ObjectId, ref: 'Collection' },
    tags: [String],
    style: [String],
    colors: [String],
    orientation: { type: String, enum: ['portrait', 'landscape', 'square'] },
    type: { type: String, default: 'original' },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
    viewCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
  },
  { ...timestamps, suppressReservedKeysWarning: true },
);
artworkSchema.index(
  { title: 'text', medium: 'text', category: 'text', tags: 'text', description: 'text' },
  { weights: { title: 10, tags: 5, medium: 3, category: 3, description: 1 } },
);
artworkSchema.index({ published: 1, availability: 1, price: 1 });
artworkSchema.index({ published: 1, createdAt: -1 });

const collectionSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    coverImage: String,
    artworks: [{ type: ObjectId, ref: 'Artwork' }],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  timestamps,
);

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: String,
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'advisor', 'admin'], default: 'customer', index: true },
    verified: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    // Hashes of live refresh tokens, one per signed-in device.
    sessions: {
      type: [{ tokenHash: String, userAgent: String, createdAt: Date, lastUsedAt: Date }],
      select: false,
      default: [],
    },
    verificationTokenHash: { type: String, select: false },
    verificationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    failedLogins: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },
    preferences: {
      categories: [String],
      mediums: [String],
      artists: [{ type: ObjectId, ref: 'Artist' }],
      priceMin: Number,
      priceMax: Number,
      styles: [String],
      palettes: [String],
      scale: { type: String, enum: ['intimate', 'considered', 'statement'] },
    },
    tasteQuiz: { completedAt: Date, skippedAt: Date },
    notificationSettings: {
      email: { type: Boolean, default: true },
      orders: { type: Boolean, default: true },
      inquiries: { type: Boolean, default: true },
      availability: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
    },
    followedArtists: [{ type: ObjectId, ref: 'Artist' }],
    recentlyViewed: [{ artwork: { type: ObjectId, ref: 'Artwork' }, at: Date }],
    addresses: [
      {
        label: String,
        name: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        phone: String,
      },
    ],
  },
  timestamps,
);
userSchema.methods.toJSON = function toJSON() {
  const out = this.toObject();
  delete out.passwordHash;
  delete out.sessions;
  delete out.verificationTokenHash;
  delete out.verificationExpiresAt;
  delete out.passwordResetTokenHash;
  delete out.passwordResetExpiresAt;
  delete out.failedLogins;
  delete out.lockedUntil;
  return out;
};

const userCollectionSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', index: true, required: true },
    name: { type: String, default: 'My Collection' },
    description: String,
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, index: true, sparse: true },
    items: [
      {
        artwork: { type: ObjectId, ref: 'Artwork' },
        note: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  timestamps,
);
userCollectionSchema.index({ user: 1, name: 1 }, { unique: true });

const cartSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', index: true, sparse: true },
    sessionId: { type: String, index: true, sparse: true },
    items: [
      {
        artwork: { type: ObjectId, ref: 'Artwork', required: true },
        quantity: { type: Number, min: 1, default: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  timestamps,
);

const addressSchema = new Schema(
  {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    number: { type: String, unique: true },
    user: { type: ObjectId, ref: 'User', index: true },
    email: { type: String, required: true },
    items: [
      {
        artwork: { type: ObjectId, ref: 'Artwork' },
        title: String,
        artistName: String,
        image: String,
        quantity: Number,
        unitPrice: Number,
      },
    ],
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    deliveryMethod: String,
    subtotal: Number,
    shipping: Number,
    insurance: Number,
    tax: Number,
    discount: { type: Number, default: 0 },
    total: Number,
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'confirmed',
        'preparing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'payment_failed',
      ],
      default: 'pending_payment',
      index: true,
    },
    payment: {
      provider: String,
      intentId: { type: String, index: true },
      status: String,
      chargeId: String,
      paidAt: Date,
      refundId: String,
      refundedAt: Date,
    },
    holdExpiresAt: Date,
    idempotencyKey: { type: String, index: true, sparse: true },
    offer: { type: ObjectId, ref: 'Inquiry' },
    tracking: { carrier: String, number: String, url: String },
    history: [{ status: String, at: { type: Date, default: Date.now }, note: String }],
  },
  timestamps,
);

const inventoryHoldSchema = new Schema(
  {
    artwork: { type: ObjectId, ref: 'Artwork', required: true, index: true },
    order: { type: ObjectId, ref: 'Order', required: true, index: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ['held', 'converted', 'released'], default: 'held', index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  timestamps,
);

const inquirySchema = new Schema(
  {
    reference: { type: String, unique: true },
    user: { type: ObjectId, ref: 'User', index: true },
    artwork: { type: ObjectId, ref: 'Artwork' },
    type: {
      type: String,
      enum: ['artwork', 'advisory', 'commission', 'viewing', 'general', 'offer'],
      default: 'artwork',
    },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
    message: { type: String, required: true },
    preferredContact: { type: String, enum: ['email', 'phone', 'whatsapp'], default: 'email' },
    preferredViewingDate: Date,
    budgetRange: String,
    status: {
      type: String,
      enum: ['new', 'contacted', 'viewing_scheduled', 'negotiation', 'acquired', 'closed'],
      default: 'new',
      index: true,
    },
    priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
    advisor: { type: ObjectId, ref: 'User', index: true },
    // Internal staff notes, never shown to the client.
    notes: [{ text: String, author: { type: ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
    // Client-visible conversation.
    messages: [
      {
        from: { type: String, enum: ['client', 'advisor'] },
        author: { type: ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    appointments: [
      {
        startsAt: Date,
        mode: { type: String, enum: ['gallery', 'virtual', 'private'] },
        location: String,
        status: { type: String, enum: ['proposed', 'confirmed', 'cancelled', 'completed'], default: 'proposed' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    offer: {
      amount: Number,
      currency: String,
      expiresAt: Date,
      status: { type: String, enum: ['open', 'accepted', 'declined', 'expired', 'withdrawn'] },
      order: { type: ObjectId, ref: 'Order' },
    },
    // Collector-initiated offer on a listed work. Acceptance opens a private offer (above).
    bid: {
      amount: Number,
      currency: String,
      counterAmount: Number,
      status: { type: String, enum: ['pending', 'countered', 'accepted', 'declined', 'withdrawn'] },
      events: [
        {
          by: { type: String, enum: ['client', 'staff'] },
          action: { type: String, enum: ['offered', 'revised', 'countered', 'accepted', 'declined', 'withdrawn'] },
          amount: Number,
          note: String,
          at: { type: Date, default: Date.now },
        },
      ],
    },
    history: [{ status: String, at: { type: Date, default: Date.now }, by: { type: ObjectId, ref: 'User' } }],
    lastActivityAt: { type: Date, default: Date.now, index: true },
  },
  timestamps,
);

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subtitle: String,
    coverImage: String,
    author: String,
    publishedAt: Date,
    readingTime: Number,
    type: String,
    tags: [String],
    content: String,
    relatedArtworks: [{ type: ObjectId, ref: 'Artwork' }],
    relatedArtists: [{ type: ObjectId, ref: 'Artist' }],
    published: { type: Boolean, default: true },
  },
  timestamps,
);

const notificationSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', index: true, required: true },
    type: {
      type: String,
      enum: ['order', 'inquiry', 'availability', 'collection', 'recommendation', 'artist', 'system'],
      required: true,
    },
    title: String,
    message: String,
    link: String,
    readAt: Date,
  },
  timestamps,
);
notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

const alertSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    artwork: { type: ObjectId, ref: 'Artwork', required: true },
    notifiedAt: Date,
  },
  timestamps,
);
alertSchema.index({ user: 1, artwork: 1 }, { unique: true });

const paymentEventSchema = new Schema(
  {
    provider: { type: String, required: true },
    eventId: { type: String, required: true },
    type: String,
    intentId: String,
    processedAt: Date,
    payload: Schema.Types.Mixed,
  },
  timestamps,
);
paymentEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

// Append-only record of staff mutations. Updates and deletes are blocked below.
const auditLogSchema = new Schema(
  {
    actor: { type: ObjectId, ref: 'User' },
    actorEmail: String,
    action: { type: String, required: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    changes: Schema.Types.Mixed,
    requestId: String,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
for (const op of ['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete', 'replaceOne']) {
  auditLogSchema.pre(op, function blockMutation(next) {
    next(new Error('Audit log entries are immutable'));
  });
}

const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });

export const Artist = model('Artist', artistSchema);
export const Artwork = model('Artwork', artworkSchema);
export const Collection = model('Collection', collectionSchema);
export const User = model('User', userSchema);
export const UserCollection = model('UserCollection', userCollectionSchema);
export const Cart = model('Cart', cartSchema);
export const Order = model('Order', orderSchema);
export const InventoryHold = model('InventoryHold', inventoryHoldSchema);
export const Inquiry = model('Inquiry', inquirySchema);
export const Article = model('Article', articleSchema);
export const Notification = model('Notification', notificationSchema);
export const AvailabilityAlert = model('AvailabilityAlert', alertSchema);
export const PaymentEvent = model('PaymentEvent', paymentEventSchema);
export const AuditLog = model('AuditLog', auditLogSchema);
export const Counter = model('Counter', counterSchema);

export async function nextSequence(name) {
  const doc = await Counter.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return doc.seq;
}
