import mongoose from 'mongoose';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { User, Session, Product, Order, Settings, Analytics, VerificationCode } from './models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const readJson = (f, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  } catch {
    return fallback;
  }
};
const SEED_PRODUCTS = readJson('products.json', []);
const SEED_SETTINGS = readJson('settings.json', {});
const SEED_ANALYTICS = readJson('analytics.json', {});

let mode = 'in-memory';
const memory = {
  users: [],
  sessions: [],
  products: [],
  orders: [],
  settings: null,
  analytics: null,
  codes: [],
};

export function getMode() {
  return mode;
}

export function getSeedProducts() {
  return SEED_PRODUCTS;
}

// ---- password + token helpers -------------------------------------------------
const SESSION_TTL_DAYS = 30;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const hashBuf = Buffer.from(hash, 'hex');
  if (hashBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(hashBuf, derived);
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ---- connection ---------------------------------------------------------------
export async function connectDb(uri) {
  if (!uri) {
    console.log('[db] MONGODB_URI not set - using in-memory store');
    mode = 'in-memory';
    resetMemory();
    return mode;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    mode = 'mongodb';
    console.log('[db] connected to MongoDB');
    await seedIfEmpty();
    return mode;
  } catch (err) {
    console.warn(`[db] MongoDB connection failed (${err.message}) - using in-memory store`);
    mode = 'in-memory';
    resetMemory();
    return mode;
  }
}

export async function seedIfEmpty() {
  if (mode !== 'mongodb') return;
  if ((await Product.estimatedDocumentCount()) === 0 && SEED_PRODUCTS.length) {
    await Product.insertMany(SEED_PRODUCTS);
    console.log(`[db] seeded ${SEED_PRODUCTS.length} products`);
  }
  if ((await Settings.estimatedDocumentCount()) === 0) {
    await Settings.create(SEED_SETTINGS);
    console.log('[db] seeded settings');
  }
  if ((await Analytics.estimatedDocumentCount()) === 0) {
    await Analytics.create(SEED_ANALYTICS);
    console.log('[db] seeded analytics');
  }
}

function resetMemory() {
  memory.users = [];
  memory.sessions = [];
  memory.products = SEED_PRODUCTS.map((p) => ({ ...p, createdAt: new Date().toISOString() }));
  memory.orders = [];
  memory.settings = { ...SEED_SETTINGS };
  memory.analytics = { ...SEED_ANALYTICS };
  memory.codes = [];
}

// ---- users --------------------------------------------------------------------
export const users = {
  async create(doc) {
    if (mode === 'mongodb') return User.create(doc);
    const row = { ...doc, createdAt: new Date().toISOString() };
    memory.users.push(row);
    return row;
  },
  async findByEmail(email) {
    if (mode === 'mongodb') return User.findOne({ email });
    return memory.users.find((u) => u.email === email) || null;
  },
  async findById(id) {
    if (mode === 'mongodb') return User.findOne({ id });
    return memory.users.find((u) => u.id === id) || null;
  },
  async update(id, patch) {
    if (mode === 'mongodb') return User.findOneAndUpdate({ id }, { $set: patch }, { new: true });
    const u = memory.users.find((x) => x.id === id);
    if (u) Object.assign(u, patch);
    return u || null;
  },
  async count() {
    if (mode === 'mongodb') return User.estimatedDocumentCount();
    return memory.users.length;
  },
};

// ---- sessions -----------------------------------------------------------------
export const sessions = {
  async create(doc) {
    if (mode === 'mongodb') return Session.create(doc);
    memory.sessions.push(doc);
    return doc;
  },
  async findUserByToken(token) {
    if (!token) return null;
    if (mode === 'mongodb') {
      const s = await Session.findOne({ token });
      if (!s || new Date(s.expiresAt).getTime() < Date.now()) return null;
      return User.findOne({ id: s.userId });
    }
    const s = memory.sessions.find((x) => x.token === token);
    if (!s || new Date(s.expiresAt).getTime() < Date.now()) return null;
    return memory.users.find((u) => u.id === s.userId) || null;
  },
  async destroy(token) {
    if (mode === 'mongodb') {
      await Session.deleteOne({ token });
      return;
    }
    memory.sessions = memory.sessions.filter((s) => s.token !== token);
  },
};

// ---- verification codes (email OTP) -------------------------------------------
export const codes = {
  async create(doc) {
    if (mode === 'mongodb') return VerificationCode.create(doc);
    const row = { ...doc, createdAt: new Date().toISOString() };
    memory.codes.push(row);
    return row;
  },
  async findLatest(email, purpose) {
    if (mode === 'mongodb') {
      return VerificationCode.findOne({ email, purpose, consumed: false }).sort({ createdAt: -1 }).lean();
    }
    const matches = memory.codes.filter((c) => c.email === email && c.purpose === purpose && !c.consumed);
    return matches.length ? matches[matches.length - 1] : null;
  },
  async update(id, patch) {
    if (mode === 'mongodb') return VerificationCode.findOneAndUpdate({ id }, { $set: patch }, { new: true });
    const c = memory.codes.find((x) => x.id === id);
    if (c) Object.assign(c, patch);
    return c || null;
  },
  async invalidate(email, purpose) {
    if (mode === 'mongodb') {
      await VerificationCode.updateMany({ email, purpose, consumed: false }, { $set: { consumed: true } });
      return;
    }
    memory.codes.forEach((c) => {
      if (c.email === email && c.purpose === purpose) c.consumed = true;
    });
  },
};

// ---- products -----------------------------------------------------------------
export const products = {
  async list() {
    if (mode === 'mongodb') return Product.find().sort({ createdAt: 1 });
    return memory.products;
  },
  async findById(id) {
    if (mode === 'mongodb') return Product.findOne({ id });
    return memory.products.find((p) => p.id === id) || null;
  },
  async create(doc) {
    if (mode === 'mongodb') return Product.create(doc);
    const row = { ...doc, createdAt: new Date().toISOString() };
    memory.products.push(row);
    return row;
  },
  async update(id, patch) {
    if (mode === 'mongodb') return Product.findOneAndUpdate({ id }, { $set: patch }, { new: true });
    const p = memory.products.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    return p || null;
  },
  async remove(id) {
    if (mode === 'mongodb') return Product.findOneAndDelete({ id });
    const idx = memory.products.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    return memory.products.splice(idx, 1)[0];
  },
  async count() {
    if (mode === 'mongodb') return Product.estimatedDocumentCount();
    return memory.products.length;
  },
};

// ---- orders -------------------------------------------------------------------
export const orders = {
  async create(doc) {
    if (mode === 'mongodb') return Order.create(doc);
    const row = { ...doc, createdAt: new Date().toISOString() };
    memory.orders.unshift(row);
    return row;
  },
  async listByUser(userId) {
    if (mode === 'mongodb') return Order.find({ userId }).sort({ createdAt: -1 }).limit(100);
    return memory.orders.filter((o) => o.userId === userId);
  },
  async findByRef(ref) {
    if (mode === 'mongodb') return Order.findOne({ orderNumber: ref });
    return memory.orders.find((o) => o.orderNumber === ref) || null;
  },
  async findByCourier(ref) {
    if (!ref) return null;
    if (mode === 'mongodb') {
      return Order.findOne({
        $or: [{ orderNumber: ref }, { courierTrackingReference: ref }, { courierShipmentId: String(ref) }],
      });
    }
    return (
      memory.orders.find(
        (o) => o.orderNumber === ref || o.courierTrackingReference === ref || o.courierShipmentId === String(ref)
      ) || null
    );
  },
  async update(ref, patch) {
    if (mode === 'mongodb') return Order.findOneAndUpdate({ orderNumber: ref }, { $set: patch }, { new: true });
    const o = memory.orders.find((x) => x.orderNumber === ref);
    if (o) Object.assign(o, patch);
    return o || null;
  },
  async count() {
    if (mode === 'mongodb') return Order.estimatedDocumentCount();
    return memory.orders.length;
  },
  async sumTotal() {
    if (mode === 'mongodb') {
      const agg = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
      return agg[0]?.total || 0;
    }
    return memory.orders.reduce((s, o) => s + Number(o.total || 0), 0);
  },
};

// ---- settings -----------------------------------------------------------------
export const settings = {
  async get() {
    if (mode === 'mongodb') {
      let s = await Settings.findOne();
      if (!s) s = await Settings.create(SEED_SETTINGS);
      return s;
    }
    return memory.settings;
  },
  async save(patch) {
    if (mode === 'mongodb') {
      let s = await Settings.findOne();
      if (!s) s = new Settings(SEED_SETTINGS);
      Object.assign(s, patch);
      return s.save();
    }
    memory.settings = { ...memory.settings, ...patch };
    return memory.settings;
  },
};

// ---- analytics ----------------------------------------------------------------
export const analytics = {
  async get() {
    if (mode === 'mongodb') {
      let a = await Analytics.findOne();
      if (!a) a = await Analytics.create(SEED_ANALYTICS);
      return a;
    }
    return memory.analytics;
  },
  async save(patch) {
    if (mode === 'mongodb') {
      let a = await Analytics.findOne();
      if (!a) a = new Analytics(SEED_ANALYTICS);
      Object.assign(a, patch);
      return a.save();
    }
    memory.analytics = { ...memory.analytics, ...patch };
    return memory.analytics;
  },
};

export async function disconnect() {
  if (mode === 'mongodb') await mongoose.disconnect();
}
