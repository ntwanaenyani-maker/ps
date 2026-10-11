import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDb, getMode, getSeedProducts, disconnect } from './store.js';
import { Product, Settings, Analytics } from './models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'));

await connectDb(process.env.MONGODB_URI);

if (getMode() !== 'mongodb') {
  console.log('[seed] No MongoDB connection. The in-memory store is seeded automatically at boot.');
} else {
  const products = getSeedProducts();
  await Product.deleteMany({});
  if (products.length) await Product.insertMany(products);

  await Settings.deleteMany({});
  await Settings.create(readJson('settings.json'));

  await Analytics.deleteMany({});
  await Analytics.create(readJson('analytics.json'));

  console.log(`[seed] wrote ${products.length} products + settings + analytics to MongoDB`);
}

await disconnect();
