import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import {
  connectDb,
  getMode,
  users,
  sessions,
  products,
  orders,
  settings,
  analytics,
  hashPassword,
  verifyPassword,
  generateToken,
} from './store.js';
import { toPublicUser, mapOrder } from './models.js';

const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_COOKIE = 'ps_session';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'phethagatsa-admin-2026-secure-key';
const VALID_PAYMENT = new Set(['card', 'instant-eft', 'payfast', 'cod', 'wire', 'paystack', 'paypal']);
const PAYPAL_BASE =
  process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

app.use(express.json());

// CORS: reflect the request origin so credentialed + Bearer requests work.
const allowed = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowed.includes('*')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && allowed.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key'
  );
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---- helpers ------------------------------------------------------------------
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return parseCookies(req)[SESSION_COOKIE];
}

function setSessionCookie(res, token, expiresAt) {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${maxAge}`);
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`);
}

function requireAdmin(req, res) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (key !== ADMIN_API_KEY) {
    res.status(403).json({ success: false, error: 'Access denied', message: 'Invalid or missing API key for admin access' });
    return false;
  }
  return true;
}

// ---- PayPal (Orders v2) -------------------------------------------------------
function paypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function paypalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  const res = await fetchWithTimeout(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || 'PayPal authentication failed');
  }
  return data.access_token;
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---- health -------------------------------------------------------------------
app.get(
  '/api/health',
  wrap(async (_req, res) => {
    res.json({
      status: 'online',
      app: 'Phethagatsa Solutions Modern African Skincare API',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      database: `MongoDB (${getMode()})`,
      environment: process.env.NODE_ENV || 'development',
      counts: {
        products: await products.count(),
        orders: await orders.count(),
        customers: await users.count(),
      },
    });
  })
);

// ---- auth ---------------------------------------------------------------------
const authRouter = express.Router();

authRouter.get(
  '/me',
  wrap(async (req, res) => {
    const user = await sessions.findUserByToken(extractToken(req));
    if (!user) return res.status(401).json({ error: 'Not signed in' });
    res.json({ user: toPublicUser(user) });
  })
);

authRouter.post(
  '/register',
  wrap(async (req, res) => {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    if (await users.findByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const created = await users.create({
      id: `usr-${crypto.randomUUID()}`,
      email,
      name,
      passwordHash: hashPassword(password),
      phone: String(req.body?.phone || '').trim() || null,
    });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sessions.create({ token, userId: created.id, expiresAt });
    setSessionCookie(res, token, expiresAt);
    res.status(201).json({ user: toPublicUser(created), token });
  })
);

authRouter.post(
  '/login',
  wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await users.findByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sessions.create({ token, userId: user.id, expiresAt });
    setSessionCookie(res, token, expiresAt);
    res.json({ user: toPublicUser(user), token });
  })
);

authRouter.post(
  '/logout',
  wrap(async (req, res) => {
    const token = extractToken(req);
    if (token) await sessions.destroy(token);
    clearSessionCookie(res);
    res.json({ ok: true });
  })
);

// Google Identity Services: the browser sends the ID token ("credential")
// issued for our web client; we verify it and mint a normal server session.
authRouter.post(
  '/google',
  wrap(async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(503).json({ error: 'Google sign-in is not configured' });

    const credential = String(req.body?.credential || '');
    if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

    let profile;
    try {
      const verify = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (!verify.ok) return res.status(401).json({ error: 'Invalid Google credential' });
      profile = await verify.json();
    } catch {
      return res.status(502).json({ error: 'Could not verify Google credential' });
    }

    if (profile.aud !== clientId) return res.status(401).json({ error: 'Google credential audience mismatch' });
    if (!['accounts.google.com', 'https://accounts.google.com'].includes(profile.iss)) {
      return res.status(401).json({ error: 'Unexpected Google credential issuer' });
    }
    if (String(profile.email_verified) !== 'true') {
      return res.status(401).json({ error: 'Google email is not verified' });
    }

    const email = String(profile.email || '').trim().toLowerCase();
    if (!email) return res.status(401).json({ error: 'Google account has no email' });

    let user = await users.findByEmail(email);
    if (!user) {
      user = await users.create({
        id: `usr-${crypto.randomUUID()}`,
        email,
        name: profile.name || email.split('@')[0],
        passwordHash: `google-oauth:${generateToken()}`,
        phone: null,
        authProvider: 'google',
        googleId: profile.sub || null,
        picture: profile.picture || null,
      });
    } else if (!user.googleId) {
      user = await users.update(user.id, {
        googleId: profile.sub || null,
        picture: profile.picture || user.picture || null,
      });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sessions.create({ token, userId: user.id, expiresAt });
    setSessionCookie(res, token, expiresAt);
    res.json({ user: toPublicUser(user), token });
  })
);

app.use('/api/auth', authRouter);

// ---- products -----------------------------------------------------------------
app.get(
  '/api/products',
  wrap(async (req, res) => {
    const { category, search } = req.query;
    let rows = await products.list();
    rows = rows.map((r) => (typeof r.toObject === 'function' ? r.toObject() : r));
    if (category && category !== 'all') rows = rows.filter((p) => p.category === category);
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
      );
    }
    res.json({ success: true, count: rows.length, products: rows, data: rows });
  })
);

app.get(
  '/api/products/:id',
  wrap(async (req, res) => {
    const product = await products.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product, product });
  })
);

app.post(
  '/api/products',
  wrap(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const created = await products.create({
      id: req.body.id || `prod-${Date.now()}`,
      name: req.body.name || 'New Botanical Formula',
      tagline: req.body.tagline || '',
      category: req.body.category || 'face-care',
      vendor: req.body.vendor || 'Phethagatsa Solutions',
      price: Number(req.body.price) || 0,
      currency: req.body.currency || 'ZAR',
      originalPrice: req.body.originalPrice,
      image: req.body.image || '',
      description: req.body.description || '',
      howToUse: req.body.howToUse || '',
      ingredients: req.body.ingredients || '',
      benefits: req.body.benefits || [],
      details: req.body.details || [],
      stock: Number(req.body.stock) || 0,
      rating: Number(req.body.rating) || 5,
      reviewCount: Number(req.body.reviewCount) || 0,
      edition: req.body.edition || 'Standard Edition',
      featured: Boolean(req.body.featured),
      variants: req.body.variants || [],
      tags: req.body.tags || [],
    });
    res.status(201).json({ success: true, data: created, product: created });
  })
);

app.put(
  '/api/products/:id',
  wrap(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const updated = await products.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: updated, product: updated });
  })
);

app.delete(
  '/api/products/:id',
  wrap(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const deleted = await products.remove(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: deleted });
  })
);

// ---- orders -------------------------------------------------------------------
function generateOrderNumber() {
  return `PS${Math.floor(100000 + Math.random() * 900000)}`;
}

app.post(
  '/api/orders',
  wrap(async (req, res) => {
    const body = req.body || {};
    const customer = body.customer || {};
    if (
      !customer.fullName?.trim() ||
      !customer.email?.trim() ||
      !customer.phone?.trim() ||
      !customer.address?.trim() ||
      !customer.city?.trim() ||
      !customer.postalCode?.trim()
    ) {
      return res.status(400).json({ error: 'All delivery details are required' });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }
    if (body.items.some((i) => !i.productId || !i.name || !(i.price > 0) || !(i.quantity > 0))) {
      return res.status(400).json({ error: 'Invalid cart items' });
    }

    const paymentMethod = VALID_PAYMENT.has(body.paymentMethod) ? body.paymentMethod : 'wire';
    const user = await sessions.findUserByToken(extractToken(req));

    const doc = {
      orderNumber: generateOrderNumber(),
      userId: user?.id ?? null,
      customerName: customer.fullName.trim(),
      customerEmail: customer.email.trim().toLowerCase(),
      customerPhone: customer.phone.trim(),
      shippingAddress: customer.address.trim(),
      city: customer.city.trim(),
      province: customer.province?.trim() || null,
      postalCode: customer.postalCode.trim(),
      country: customer.country?.trim() || 'South Africa',
      items: body.items,
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      shipping: Number(body.shipping) || 0,
      tax: 0,
      total: Number(body.total) || 0,
      currency: body.currency || 'ZAR',
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      notes: body.notes || null,
    };

    let created;
    for (let attempt = 0; attempt < 3 && !created; attempt++) {
      doc.orderNumber = generateOrderNumber();
      try {
        created = await orders.create(doc);
      } catch (e) {
        if (attempt === 2) throw e;
      }
    }

    if (user) {
      await users.update(user.id, {
        totalOrdersCount: (user.totalOrdersCount ?? 0) + 1,
        loyaltyPoints: (user.loyaltyPoints ?? 0) + Math.round(doc.total / 10),
      });
    }

    res.status(201).json({ order: mapOrder(created) });
  })
);

app.get(
  '/api/orders/mine',
  wrap(async (req, res) => {
    const user = await sessions.findUserByToken(extractToken(req));
    if (!user) return res.status(401).json({ error: 'Not signed in' });
    const rows = await orders.listByUser(user.id);
    res.json({ orders: rows.map(mapOrder) });
  })
);

app.get(
  '/api/orders/:ref',
  wrap(async (req, res) => {
    const ref = decodeURIComponent(req.params.ref).toUpperCase().replace('#', '');
    const normalized = ref.startsWith('PS') ? ref : `PS${ref}`;
    const order = (await orders.findByRef(ref)) || (await orders.findByRef(normalized));
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: mapOrder(order) });
  })
);

// ---- payments (Paystack-ready) ------------------------------------------------
app.post(
  '/api/pay/initialize',
  wrap(async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const { email, amount, orderNumber, callbackUrl } = req.body || {};
    if (!email || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Email and a positive amount are required' });
    }
    if (!secret) {
      return res.json({
        paystackConfigured: false,
        message: 'Card payments are coming soon. Please use Offline EFT or Pay On Delivery for now.',
      });
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const init = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: 'ZAR',
        reference: orderNumber ? `${orderNumber}-${Date.now().toString(36)}` : undefined,
        metadata: { orderNumber },
        callback_url: callbackUrl || `${origin}/checkout-complete`,
      }),
    });
    const data = await init.json();
    if (!init.ok || !data.status || !data.data?.authorization_url) {
      return res.status(502).json({ error: data.message || 'Payment could not be initialized' });
    }
    res.json({
      paystackConfigured: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });
  })
);

// ---- payments (PayPal Orders v2) ----------------------------------------------
app.get('/api/pay/paypal/status', (_req, res) => {
  res.json({ paypalConfigured: paypalConfigured() });
});

app.post(
  '/api/pay/paypal/create',
  wrap(async (req, res) => {
    if (!paypalConfigured()) {
      return res.status(503).json({ error: 'Card / PayPal payments are not configured yet.' });
    }
    const { amount, currency = 'ZAR', orderNumber } = req.body || {};
    if (!(Number(amount) > 0)) {
      return res.status(400).json({ error: 'A positive amount is required' });
    }
    const token = await paypalAccessToken();
    const r = await fetchWithTimeout(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderNumber || undefined,
            description: orderNumber ? `Phethagatsa order ${orderNumber}` : 'Phethagatsa order',
            amount: { currency_code: String(currency).toUpperCase(), value: Number(amount).toFixed(2) },
          },
        ],
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.id) {
      return res.status(502).json({ error: data.message || 'Could not start PayPal checkout' });
    }
    res.json({ id: data.id });
  })
);

app.post(
  '/api/pay/paypal/capture',
  wrap(async (req, res) => {
    if (!paypalConfigured()) {
      return res.status(503).json({ error: 'Card / PayPal payments are not configured yet.' });
    }
    const { orderId, orderNumber } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'Missing PayPal order id' });
    const token = await paypalAccessToken();
    const r = await fetchWithTimeout(`${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(502).json({ error: data.message || 'Could not capture PayPal payment' });
    }
    const completed = data.status === 'COMPLETED';
    if (completed && orderNumber) {
      await orders.update(String(orderNumber).toUpperCase(), {
        paymentStatus: 'paid',
        status: 'confirmed',
        paypalOrderId: data.id || orderId,
        paidAt: new Date(),
      });
    }
    res.json({ status: data.status, id: data.id || orderId, captured: completed });
  })
);

// ---- settings + analytics -----------------------------------------------------
app.get('/api/settings', wrap(async (_req, res) => res.json({ success: true, data: await settings.get() })));
app.put(
  '/api/settings',
  wrap(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true, data: await settings.save(req.body || {}) });
  })
);

app.get(
  '/api/analytics',
  wrap(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const [totalRevenue, totalOrders, totalCustomers, totalProducts] = await Promise.all([
      orders.sumTotal(),
      orders.count(),
      users.count(),
      products.count(),
    ]);
    const base = (await analytics.get())?.toObject?.() || (await analytics.get()) || {};
    res.json({
      success: true,
      data: {
        ...base,
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        averageOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
      },
    });
  })
);

app.get('/api/customers', wrap(async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ success: true, count: await users.count(), data: [] });
}));

// ---- whatsapp link ------------------------------------------------------------
app.post('/api/whatsapp/order-link', (req, res) => {
  const { orderId, customerName, totalZAR, items } = req.body || {};
  const phoneNumber = process.env.WHATSAPP_NUMBER || '27723819402';
  const itemsSummary = Array.isArray(items)
    ? items.map((i) => `• ${i.name || i.product?.name} (x${i.quantity || 1}) - R${i.price || i.product?.price}`).join('\n')
    : '';
  const message = `*Dumela Phethagatsa Solutions!* 🇿🇦\n\nI have placed order *#${orderId || 'NEW'}*\n*Customer:* ${customerName || 'Valued Customer'}\n*Total:* R${totalZAR}\n\n*Items:*\n${itemsSummary}\n\nPlease confirm banking / delivery details. Ke a leboga!`;
  res.json({ success: true, url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, message });
});

app.get('/api/admin/secure-access', (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ success: true, message: 'Admin access granted' });
});

app.use((req, res) => res.status(404).json({ success: false, error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('unhandled error', err);
  res.status(500).json({ success: false, error: 'Service error. Please try again.' });
});

async function start() {
  await connectDb(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`[server] Phethagatsa API listening on :${PORT} (db: ${getMode()})`);
  });
}

start();

export default app;
