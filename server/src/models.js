import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    province: { type: String, default: null },
    postalCode: { type: String, default: null },
    memberTier: { type: String, default: 'Bronze' },
    loyaltyPoints: { type: Number, default: 50 },
    totalOrdersCount: { type: Number, default: 0 },
    memberSince: { type: String, default: 'Just now' },
    role: { type: String, default: 'customer' },
    authProvider: { type: String, default: 'local' },
    googleId: { type: String, default: null },
    picture: { type: String, default: null },
    wishlist: { type: [String], default: [] },
  },
  { collection: 'users', timestamps: { createdAt: true, updatedAt: false } }
);

const SessionSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { collection: 'sessions', timestamps: { createdAt: true, updatedAt: false } }
);

const ProductSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    handle: String,
    name: { type: String, required: true },
    tagline: { type: String, default: '' },
    category: { type: String, default: 'all' },
    vendor: { type: String, default: 'Phethagatsa Solutions' },
    type: String,
    sku: String,
    grams: Number,
    price: { type: Number, required: true },
    currency: { type: String, default: 'ZAR' },
    originalPrice: Number,
    image: { type: String, default: '' },
    additionalImages: { type: [String], default: [] },
    description: { type: String, default: '' },
    bodyHtml: String,
    howToUse: String,
    ingredients: String,
    benefits: { type: [String], default: [] },
    details: { type: [String], default: [] },
    dimensions: String,
    materials: String,
    artisan: String,
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    edition: { type: String, default: 'Standard Edition' },
    featured: { type: Boolean, default: false },
    variants: { type: [Schema.Types.Mixed], default: [] },
    tags: { type: [String], default: [] },
  },
  { collection: 'products', timestamps: { createdAt: true, updatedAt: false } }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, default: null },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'South Africa' },
    items: { type: [Schema.Types.Mixed], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'ZAR' },
    paymentMethod: { type: String, default: 'wire' },
    paymentStatus: { type: String, default: 'pending' },
    paystackReference: String,
    status: { type: String, default: 'pending' },
    notes: { type: String, default: null },
  },
  { collection: 'orders', timestamps: { createdAt: true, updatedAt: false } }
);

const SettingsSchema = new Schema(
  {
    storeName: { type: String, default: 'Phethagatsa Solutions' },
    storeEmail: { type: String, default: 'support@phethagatsa.co.za' },
    storePhone: { type: String, default: '+27 72 381 9402' },
    storeAddress: { type: String, default: 'Johannesburg, South Africa' },
    whatsappNumber: { type: String, default: '27723819402' },
    currency: { type: String, default: 'ZAR' },
    paymentGateway: { type: String, default: 'Paystack' },
    defaultShipping: { type: Number, default: 65 },
    freeShippingThreshold: { type: Number, default: 450 },
  },
  { collection: 'settings', timestamps: true }
);

const AnalyticsSchema = new Schema(
  {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    salesGrowthPct: { type: Number, default: 0 },
    monthlySales: { type: [Schema.Types.Mixed], default: [] },
  },
  { collection: 'analytics', timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
export const Session = mongoose.model('Session', SessionSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Order = mongoose.model('Order', OrderSchema);
export const Settings = mongoose.model('Settings', SettingsSchema);
export const Analytics = mongoose.model('Analytics', AnalyticsSchema);

export function toPublicUser(user) {
  if (!user) return null;
  const u = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete u.passwordHash;
  delete u._id;
  delete u.__v;
  return u;
}

export function mapOrder(row) {
  const o = typeof row.toObject === 'function' ? row.toObject() : { ...row };
  const createdAt = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt || Date.now());
  const estimatedDelivery = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: o.orderNumber,
    orderNumber: o.orderNumber,
    customer: {
      fullName: o.customerName,
      email: o.customerEmail,
      phone: o.customerPhone,
      address: o.shippingAddress,
      city: o.city,
      province: o.province ?? undefined,
      postalCode: o.postalCode,
      country: o.country,
    },
    items: o.items,
    subtotal: Number(o.subtotal),
    discount: Number(o.discount),
    shipping: Number(o.shipping),
    tax: Number(o.tax),
    total: Number(o.total),
    currency: o.currency,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    status: o.status,
    createdAt: createdAt.toISOString(),
    estimatedDelivery,
    trackingNumber: o.notes ?? undefined,
    notes: o.notes ?? undefined,
  };
}
