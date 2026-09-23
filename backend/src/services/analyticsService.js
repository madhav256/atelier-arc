import { Order, Inquiry, Artwork, User } from '../models/index.js';

const PAID = ['confirmed', 'preparing', 'shipped', 'delivered'];

export async function dashboard({ from, to } = {}) {
  const since = from ? new Date(from) : new Date(Date.now() - 365 * 864e5);
  const until = to ? new Date(to) : new Date();
  const range = { createdAt: { $gte: since, $lte: until } };
  const [revenue, byMonth, ordersByStatus, funnel, topViewed, topSaved, inventory, customers, recentOrders, openInquiries] = await Promise.all([
    Order.aggregate([{ $match: { ...range, status: { $in: PAID } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, avg: { $avg: '$total' } } }]),
    Order.aggregate([{ $match: { ...range, status: { $in: PAID } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Order.aggregate([{ $match: range }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Inquiry.aggregate([{ $match: range }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Artwork.find({ published: true }).sort({ viewCount: -1 }).limit(5).select('title slug viewCount saveCount inquiryCount').lean(),
    Artwork.find({ published: true }).sort({ saveCount: -1 }).limit(5).select('title slug viewCount saveCount inquiryCount').lean(),
    Artwork.aggregate([{ $group: { _id: '$availability', count: { $sum: 1 }, value: { $sum: { $ifNull: ['$price', 0] } } } }]),
    User.countDocuments({ role: 'customer', ...range }),
    Order.find().sort({ createdAt: -1 }).limit(8).select('number email total currency status createdAt').lean(),
    Inquiry.countDocuments({ status: { $nin: ['acquired', 'closed'] } }),
  ]);
  const funnelMap = Object.fromEntries(funnel.map((f) => [f._id, f.count]));
  const inquiriesTotal = funnel.reduce((s, f) => s + f.count, 0);
  return {
    range: { from: since, to: until },
    revenue: revenue[0]?.total || 0,
    orders: revenue[0]?.count || 0,
    averageOrderValue: Math.round(revenue[0]?.avg || 0),
    byMonth,
    ordersByStatus: Object.fromEntries(ordersByStatus.map((s) => [s._id, s.count])),
    inquiries: { total: inquiriesTotal, open: openInquiries, byStatus: funnelMap, conversionRate: inquiriesTotal ? (funnelMap.acquired || 0) / inquiriesTotal : 0 },
    topViewed,
    topSaved,
    inventory: Object.fromEntries(inventory.map((i) => [i._id, { count: i.count, value: i.value }])),
    newCustomers: customers,
    recentOrders,
  };
}
