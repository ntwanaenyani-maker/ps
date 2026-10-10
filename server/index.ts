import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose, { Schema, Document } from 'mongoose';
import { INITIAL_PRODUCTS, SEED_ORDERS, SEED_CUSTOMER, INITIAL_SETTINGS, INITIAL_ANALYTICS } from '../src/data/initialProducts';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phethagatsa';
const MONGODB_NAME = 'phethagatsa';

let isConnected = false;
let connectionError = null;

async function connectToMongoDB() {
  if (isConnected) return;
  
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_NAME,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    connectionError = null;
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    // Seed initial data if database is empty
    await seedInitialData();
  } catch (error) {
    connectionError = error;
    console.error('❌ MongoDB Atlas connection failed:', error);
    isConnected = false;
  }
}

// Product Schema
const ProductSchema = new Schema({
  id: String,
  name: String,
  tagline: String,
  price: Number,
  category: String,
  image: String,
  description: String,
  ingredients: String,
  howToUse: String,
  benefits: [String],
  stock: Number,
  rating: Number,
  reviewCount: Number,
  reviews: [{ type: Schema.Types.Mixed }],
  tags: [String],
}, { collection: 'products' });

// Customer Schema  
const CustomerSchema = new Schema({
  id: String,
  name: String,
  email: String,
  memberTier: String,
  loyaltyPoints: Number,
  totalOrdersCount: Number,
  memberSince: String,
  wishlistIds: [String],
  phone: String,
  address: String,
  city: String,
  province: String,
  postalCode: String,
}, { collection: 'customers' });

// Order Schema
const OrderSchema = new Schema({
  id: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  shippingAddress: String,
  items: [Schema.Types.Mixed],
  subtotal: Number,
  shippingCost: Number,
  discount: Number,
  total: Number,
  status: String,
  paymentMethod: String,
  createdAt: String,
  trackingNumber: String,
}, { collection: 'orders' });

// Settings Schema
const SettingsSchema = new Schema({
  storeName: String,
  tagline: String,
  description: String,
  currency: String,
  freeShippingThreshold: Number,
  contactEmail: String,
  whatsappNumber: String,
  theme: String,
}, { collection: 'settings' });

// Analytics Schema
const AnalyticsSchema = new Schema({
  dailyVisits: Number,
  totalProducts: Number,
  totalOrders: Number,
  conversionRate: Number,
}, { collection: 'analytics' });

// Model definitions
const Product = mongoose.model('Product', ProductSchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Order = mongoose.model('Order', OrderSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const Analytics = mongoose.model('Analytics', AnalyticsSchema);

// Seed initial data if needed
async function seedInitialData() {
  const productCount = await Product.countDocuments();
  const customerCount = await Customer.countDocuments();
  const orderCount = await Order.countDocuments();
  const settingsCount = await Settings.countDocuments();
  const analyticsCount = await Analytics.countDocuments();

  if (productCount === 0) {
    await Product.insertMany(INITIAL_PRODUCTS);
    console.log('🌱 Seeded initial products data');
  }
  if (customerCount === 0) {
    await Customer.insertMany([SEED_CUSTOMER]);
    console.log('🌱 Seeded initial customer data');
  }
  if (orderCount === 0) {
    await Order.insertMany(SEED_ORDERS);
    console.log('🌱 Seeded initial orders data');
  }
  if (settingsCount === 0) {
    await Settings.create(INITIAL_SETTINGS);
    console.log('🌱 Seeded initial settings data');
  }
  if (analyticsCount === 0) {
    await Analytics.create(INITIAL_ANALYTICS);
    console.log('🌱 Seeded initial analytics data');
  }
}

// Ensure database connection before serving requests
app.use(async (req: any, res: any, next: any) => {
  if (!isConnected) {
    await connectToMongoDB();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Database service unavailable',
        details: 'Unable to connect to MongoDB Atlas. Please check credentials and network access.',
      });
    }
  }
  next();
});

// 1. Health check & System Info
app.get('/api/health', async (req: Request, res: Response) => {
  const mongoStatus = isConnected ? 'Connected' : 'Connecting';
  try {
    await mongoose.connection.db.admin().ping();
    mongoStatus = 'Connected';
  } catch {
    mongoStatus = 'Disconnected';
  }
  
  const productsCount = await Product.countDocuments();
  const ordersCount = await Order.countDocuments();
  const customersCount = await Customer.countDocuments();
  
  res.json({
    status: 'online',
    app: 'Phethagatsa Solutions Modern African Skincare API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: `MongoDB Atlas (${mongoStatus})`,
    environment: process.env.NODE_ENV || 'development',
    counts: {
      products: productsCount,
      orders: ordersCount,
      customers: customersCount,
    },
  });
});

// 2. Product Endpoints
app.get('/api/products', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  let query: any = {};
  
  if (category && category !== 'all') {
    query.category = category;
  }
  if (search && typeof search === 'string') {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(query);
  res.json({ success: true, count: products.length, data: products });
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  const product = await Product.findOne({ id: req.params.id });
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

app.post('/api/products', async (req: Request, res: Response) => {
  const newProduct = new Product({
    id: `prod-${Date.now()}`,
    name: req.body.name || 'New Botanical Formula',
    tagline: req.body.tagline || 'African Botanicals',
    price: Number(req.body.price) || 250,
    category: req.body.category || 'face-care',
    image: req.body.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    description: req.body.description || '',
    ingredients: req.body.ingredients || 'Organic botanicals',
    howToUse: req.body.howToUse || 'Apply gently twice daily.',
    benefits: req.body.benefits || ['Hydrating', 'Nourishing'],
    stock: Number(req.body.stock) || 50,
    rating: 5.0,
    reviewCount: 0,
    reviews: [],
    tags: req.body.tags || ['organic'],
  });

  const savedProduct = await newProduct.save();
  res.status(201).json({ success: true, data: savedProduct });
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  const updatedProduct = await Product.findOneAndUpdate(
    { id: req.params.id },
    { $set: req.body },
    { new: true }
  );

  if (!updatedProduct) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, data: updatedProduct });
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
  if (!deletedProduct) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, data: deletedProduct });
});

// 3. Orders Endpoints
app.get('/api/orders', async (req: Request, res: Response) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});

app.post('/api/orders', async (req: Request, res: Response) => {
  const newOrder = new Order({
    id: `PS-${Date.now().toString().slice(-5)}`,
    customerName: req.body.customerName || 'Valued Customer',
    customerEmail: req.body.customerEmail || 'customer@example.com',
    customerPhone: req.body.customerPhone || '+27 72 000 0000',
    shippingAddress: req.body.shippingAddress || 'South Africa',
    items: req.body.items || [],
    subtotal: req.body.subtotal || 0,
    shippingCost: req.body.shippingCost || 0,
    discount: req.body.discount || 0,
    total: req.body.total || 0,
    status: 'pending',
    paymentMethod: req.body.paymentMethod || 'instant_eft',
    createdAt: new Date().toISOString(),
  });

  const savedOrder = await newOrder.save();
  res.status(201).json({ success: true, data: savedOrder });
});

app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  const { status, trackingNumber } = req.body;
  const update: any = {};
  if (status) update.status = status;
  if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;

  const updatedOrder = await Order.findOneAndUpdate(
    { id: req.params.id },
    { $set: update },
    { new: true }
  );

  if (!updatedOrder) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, data: updatedOrder });
});

// 4. Analytics & Customers
app.get('/api/analytics', async (req: Request, res: Response) => {
  const [productCount, ordersCount, customersCount] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Customer.countDocuments(),
  ]);

  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders: ordersCount,
      activeCustomers: customersCount,
      productsCount: productCount,
    },
  });
});

app.get('/api/customers', async (req: Request, res: Response) => {
  const customers = await Customer.find();
  res.json({ success: true, count: customers.length, data: customers });
});

// 5. Store Settings
app.get('/api/settings', async (req: Request, res: Response) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(INITIAL_SETTINGS);
  }
  res.json({ success: true, data: settings });
});

app.put('/api/settings', async (req: Request, res: Response) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings(INITIAL_SETTINGS);
  }

  Object.assign(settings, req.body);
  const savedSettings = await settings.save();
  res.json({ success: true, data: savedSettings });
});

// 6. WhatsApp Direct Order Link Generator
app.post('/api/whatsapp/order-link', (req: Request, res: Response) => {
  const { orderId, customerName, totalZAR, items } = req.body;
  const phoneNumber = process.env.WHATSAPP_NUMBER || '27723819402';

  let itemsSummary = '';
  if (Array.isArray(items)) {
    itemsSummary = items.map((i: any) => `• ${i.name || i.product?.name} (x${i.quantity || 1}) - R${i.price || i.product?.price}`).join('\n');
  }

  const message = `*Dumela Phethagatsa Solutions!* 🇿🇦\n\nI have placed order *#${orderId || 'NEW'}*\n*Customer:* ${customerName || 'Valued Customer'}\n*Total:* R${totalZAR}\n\n*Items:*\n${itemsSummary}\n\nPlease confirm banking / delivery details. Ke a leboga!`;
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  res.json({ success: true, url, message });
});

// Security: Admin-only access endpoint with API key authentication
app.get('/api/admin/secure-access', (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  // Admin API key - this would be securely stored in environment variables
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'phethagatsa-admin-2026-secure-key';
  
  if (apiKey !== ADMIN_API_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Invalid or missing API key for admin access'
    });
  }

  res.json({
    success: true,
    message: 'Admin access granted',
    data: 'This endpoint is only accessible with valid admin API key'
  });
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test' && !process.env.VITE) {
  connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Phethagatsa Solutions API Server running on port ${PORT}`);
    console.log(`📊 MongoDB Atlas: ${MONGODB_URI.replace(/:[^:@]+@/, ':***@')}`);
  });
}