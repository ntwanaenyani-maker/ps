import { Product, Order, Review, CartItem, UserAccount, OrderStatus, StoreSettings, AdminAnalytics } from '../types/store';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_ANALYTICS,
} from '../data/initialProducts';

const DB_KEYS = {
  PRODUCTS: 'phethagatsa_wellness_v4_products',
  ORDERS: 'phethagatsa_wellness_v4_orders',
  REVIEWS: 'phethagatsa_wellness_v4_reviews',
  CART: 'phethagatsa_wellness_v4_cart',
  WISHLIST: 'phethagatsa_wellness_v4_wishlist',
  USER: 'phethagatsa_wellness_v4_user',
  CUSTOMERS: 'phethagatsa_wellness_v4_customers',
  SETTINGS: 'phethagatsa_wellness_v4_settings',
  ANALYTICS: 'phethagatsa_wellness_v4_analytics',
} as const;

// Marks storage that has been purged of all demo/mock data. Earlier versions of
// the store seeded a demo customer, demo orders and a demo wishlist on first
// boot; this flag makes that a one-time migration for returning visitors.
const PURGE_FLAG = 'phethagatsa_wellness_v4_demo_purged';

type Listener = () => void;

class FreeDatabaseService {
  private listeners: Map<string, Set<Listener>> = new Map();

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): void {
    if (typeof window === 'undefined') return;

    try {
      // One-time purge of demo/mock data seeded by older versions of the store.
      // Commercial mode: every visitor starts signed out with an empty slate.
      if (!localStorage.getItem(PURGE_FLAG)) {
        localStorage.removeItem(DB_KEYS.ORDERS);
        localStorage.removeItem(DB_KEYS.USER);
        localStorage.removeItem(DB_KEYS.CUSTOMERS);
        localStorage.removeItem(DB_KEYS.WISHLIST);
        localStorage.setItem(PURGE_FLAG, 'true');
      }

      // 1. Products (local cache of the server catalog)
      const existingProducts = localStorage.getItem(DB_KEYS.PRODUCTS);
      if (!existingProducts) {
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      } else {
        try {
          const parsed = JSON.parse(existingProducts);
          // Check if parsed includes our flagship items
          const hasPuso = parsed.some((p: Product) => p.id === 'puso-glow-face-cream');
          if (!hasPuso) {
            // Merge or replace
            localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
          }
        } catch {
          localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        }
      }

      // 2. Cart (no wishlist seeding — wishlists belong to signed-in accounts)
      if (!localStorage.getItem(DB_KEYS.CART)) {
        localStorage.setItem(DB_KEYS.CART, JSON.stringify([]));
      }

      // 3. Store Settings
      if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      }

      // 4. Analytics
      if (!localStorage.getItem(DB_KEYS.ANALYTICS)) {
        localStorage.setItem(DB_KEYS.ANALYTICS, JSON.stringify(INITIAL_ANALYTICS));
      }
    } catch (e) {
      console.warn('Free Database initialization note:', e);
    }
  }

  // --- PUB / SUB REACTIVE STORE ---
  public subscribe(collection: string, listener: Listener): () => void {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, new Set());
    }
    this.listeners.get(collection)!.add(listener);
    return () => {
      this.listeners.get(collection)?.delete(listener);
    };
  }

  // --- SERVER DATA BRIDGE ---
  public seedServerProducts(serverProducts: Product[]): void {
    if (typeof window === 'undefined' || !Array.isArray(serverProducts) || serverProducts.length === 0) return;
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(serverProducts));
    this.notify('products');
  }

  public setCurrentUser(user: UserAccount): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    this.notify('user');
  }

  public addServerOrder(order: Order): void {
    if (typeof window === 'undefined') return;
    const orders = this.getOrders();
    if (!orders.some((o) => o.id === order.id)) {
      orders.unshift(order);
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
      this.notify('orders');
    }
  }

  private notify(collection: string): void {
    const subs = this.listeners.get(collection);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb();
        } catch (err) {
          console.error(`Error in subscriber for ${collection}:`, err);
        }
      });
    }
    this.listeners.get('*')?.forEach((cb) => cb());
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(DB_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public addProduct(newProduct: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const id = newProduct.handle || `ps-${Date.now().toString(36)}`;
    const product: Product = { ...newProduct, id };
    products.unshift(product);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify('products');
    return product;
  }

  public updateProduct(updated: Product): boolean {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === updated.id);
    if (idx === -1) return false;
    products[idx] = updated;
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify('products');
    return true;
  }

  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(filtered));
    this.notify('products');
    return true;
  }

  // --- CART ---
  public getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(DB_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveCart(items: CartItem[]): void {
    localStorage.setItem(DB_KEYS.CART, JSON.stringify(items));
    this.notify('cart');
  }

  public addToCart(product: Product, quantity = 1, variantId?: string): CartItem[] {
    const cart = this.getCart();
    const selectedVariant = product.variants?.find((v) => v.id === variantId) || product.variants?.[0];
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedVariant?.id === selectedVariant?.id
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product,
        quantity,
        selectedVariant,
      });
    }

    this.saveCart(cart);
    return cart;
  }

  public updateCartQuantity(productId: string, variantId: string | undefined, delta: number): CartItem[] {
    let cart = this.getCart();
    cart = cart
      .map((item) => {
        if (item.product.id === productId && item.selectedVariant?.id === variantId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    this.saveCart(cart);
    return cart;
  }

  public removeFromCart(productId: string, variantId?: string): CartItem[] {
    let cart = this.getCart();
    cart = cart.filter(
      (item) => !(item.product.id === productId && item.selectedVariant?.id === variantId)
    );
    this.saveCart(cart);
    return cart;
  }

  public clearCart(): void {
    this.saveCart([]);
  }

  // --- USER ACCOUNT & CUSTOMERS ---
  // Commercial mode: visitors start signed out. This only returns a user when
  // one actually signed in (or registered) on this device.
  public getCurrentUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(DB_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public updateCurrentUser(updates: Partial<UserAccount>): UserAccount | null {
    const current = this.getCurrentUser();
    if (!current) return current ?? ({} as UserAccount);
    const updated: UserAccount = { ...current, ...updates };
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(updated));
    this.updateCustomer(updated);
    this.notify('user');
    return updated;
  }

  public logoutUser(): void {
    localStorage.removeItem(DB_KEYS.USER);
    this.notify('user');
  }

  public getCustomers(): UserAccount[] {
    try {
      const data = localStorage.getItem(DB_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addCustomer(customer: UserAccount): void {
    const list = this.getCustomers();
    if (!list.some((c) => c.id === customer.id)) {
      list.push(customer);
      localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(list));
      this.notify('customers');
    }
  }

  public registerUser(name: string, email: string, password: string): UserAccount {
    const customers = this.getCustomers();
    const existing = customers.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error('Account already exists with this email');
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      memberTier: 'Bronze',
      loyaltyPoints: 50,
      totalOrdersCount: 0,
      memberSince: 'Just now',
      wishlistIds: [],
    };
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(newUser));
    this.addCustomer(newUser);
    this.notify('user');
    return newUser;
  }

  public updateCustomer(customer: UserAccount): boolean {
    const list = this.getCustomers();
    const idx = list.findIndex((c) => c.id === customer.id);
    if (idx === -1) return false;
    list[idx] = customer;
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(list));
    this.notify('customers');
    return true;
  }

  // --- WISHLIST ---
  public getWishlist(): string[] {
    const user = this.getCurrentUser();
    if (user && Array.isArray(user.wishlistIds)) {
      return user.wishlistIds;
    }
    try {
      const data = localStorage.getItem(DB_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public toggleWishlist(productId: string): { inWishlist: boolean; requiresLogin: boolean } {
    const user = this.getCurrentUser();
    if (!user) {
      return { inWishlist: false, requiresLogin: true };
    }

    const currentList = this.getWishlist();
    const exists = currentList.includes(productId);
    const updated = exists ? currentList.filter((id) => id !== productId) : [...currentList, productId];

    user.wishlistIds = updated;
    this.updateCurrentUser(user);
    localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify(updated));
    this.notify('wishlist');
    return { inWishlist: !exists, requiresLogin: false };
  }

  // --- ORDERS ---
  // Only orders actually placed on this device (server orders get mirrored here
  // via addServerOrder). No demo orders are seeded.
  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(DB_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getOrderById(id: string): Order | undefined {
    const clean = id.trim().toUpperCase().replace('#', '');
    return this.getOrders().find((o) => o.id.toUpperCase().replace('#', '') === clean);
  }

  public createOrder(orderInput: Omit<Order, 'id' | 'createdAt' | 'status' | 'estimatedDelivery' | 'timeline'>): Order {
    const orders = this.getOrders();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `PS${randomSuffix}`;

    const now = new Date();
    const formattedNow = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newOrder: Order = {
      ...orderInput,
      id,
      status: 'pending',
      createdAt: formattedNow,
      estimatedDelivery,
      timeline: [
        { title: 'Order Placed', description: 'Order confirmed and verified via payment channel', timestamp: formattedNow, completed: true },
        { title: 'Processing', description: 'Lab preparation and quality control inspection', timestamp: 'Pending', completed: false },
        { title: 'Shipped', description: 'Assigned to South African Doorstep Courier', timestamp: 'Pending', completed: false },
        { title: 'Delivered', description: 'Delivered and signed at recipient doorstep', timestamp: 'Pending', completed: false },
      ],
    };

    orders.unshift(newOrder);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));

    // Deduct stock
    const products = this.getProducts();
    orderInput.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));

    // Update customer order count & loyalty points (+10 pts per R100 spent)
    const user = this.getCurrentUser();
    if (user) {
      user.totalOrdersCount = (user.totalOrdersCount || 0) + 1;
      user.loyaltyPoints = (user.loyaltyPoints || 0) + Math.round(newOrder.total / 10);
      this.updateCurrentUser(user);
    }

    this.notify('orders');
    this.notify('products');
    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus): boolean {
    const orders = this.getOrders();
    const cleanId = orderId.toUpperCase().replace('#', '');
    const idx = orders.findIndex((o) => o.id.toUpperCase().replace('#', '') === cleanId);
    if (idx === -1) return false;

    const order = orders[idx];
    order.status = newStatus;

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + `, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    // Update timeline stages
    if (!order.timeline || order.timeline.length < 4) {
      order.timeline = [
        { title: 'Order Placed', description: 'Order verified', timestamp: order.createdAt, completed: true },
        { title: 'Processing', description: 'Formulations prepared & sanitized at Pretoria lab', timestamp: timeStr, completed: false },
        { title: 'Shipped', description: 'Dispatched with The Courier Guy', timestamp: timeStr, completed: false },
        { title: 'Delivered', description: 'Delivered & signed', timestamp: timeStr, completed: false },
      ];
    }

    if (newStatus === 'pending') {
      order.timeline[0].completed = true;
      order.timeline[1].completed = false;
      order.timeline[2].completed = false;
      order.timeline[3].completed = false;
    } else if (newStatus === 'processing') {
      order.timeline[0].completed = true;
      order.timeline[1].completed = true;
      order.timeline[1].timestamp = timeStr;
      order.timeline[2].completed = false;
      order.timeline[3].completed = false;
    } else if (newStatus === 'shipped') {
      order.timeline[0].completed = true;
      order.timeline[1].completed = true;
      order.timeline[2].completed = true;
      order.timeline[2].timestamp = timeStr;
      order.timeline[3].completed = false;
    } else if (newStatus === 'delivered') {
      order.timeline.forEach((t) => (t.completed = true));
      order.timeline[3].timestamp = timeStr;
    }

    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    this.notify('orders');
    return true;
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    try {
      const data = localStorage.getItem(DB_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public updateSettings(settings: StoreSettings): void {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify('settings');
  }

  // --- ANALYTICS ---
  public getAnalytics(): AdminAnalytics {
    const orders = this.getOrders();
    const customers = this.getCustomers();
    const products = this.getProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avg = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers: customers.length,
      totalProducts: products.length,
      averageOrderValue: avg,
      salesGrowthPct: 16,
      monthlySales: INITIAL_ANALYTICS.monthlySales,
    };
  }

  // --- COUPONS ---
  public validateCoupon(code: string): { valid: boolean; discountPercent: number; label: string } {
    const clean = code.trim().toUpperCase();
    if (clean === 'PHETHA10' || clean === 'WELCOME10') {
      return { valid: true, discountPercent: 10, label: 'Welcome 10% Off' };
    }
    if (clean === 'GLOW15' || clean === 'RADIANT15') {
      return { valid: true, discountPercent: 15, label: 'Botanical Glow 15% Off' };
    }
    if (clean === 'ECZEMA20') {
      return { valid: true, discountPercent: 20, label: 'Care Relief 20% Off' };
    }
    return { valid: false, discountPercent: 0, label: 'Invalid or expired code. Try PHETHA10 or GLOW15' };
  }

  // --- REVIEWS ---
  public getReviews(productId?: string): Review[] {
    try {
      const data = localStorage.getItem(DB_KEYS.REVIEWS);
      const all: Review[] = data ? JSON.parse(data) : [];
      if (!productId) return all;
      return all.filter((r) => r.productId === productId);
    } catch {
      return [];
    }
  }

  public getReviewBreakdown(productId: string) {
    const reviews = this.getReviews(productId);
    const total = reviews.length;
    if (total === 0) {
      return { average: 5.0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, percentages: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
      sum += r.rating;
    });
    const avg = Number((sum / total).toFixed(1));
    const pcts: Record<number, number> = {};
    for (let s = 1; s <= 5; s++) {
      pcts[s] = Math.round(((dist[s] || 0) / total) * 100);
    }
    return { average: avg, total, distribution: dist, percentages: pcts };
  }

  public addReview(reviewInput: Partial<Review> & { productId: string; author: string; rating: number; comment: string }): Review {
    const all = this.getReviews();
    const review: Review = {
      id: reviewInput.id || `rev-${Date.now().toString(36)}`,
      productId: reviewInput.productId,
      author: reviewInput.author,
      authorLocation: reviewInput.authorLocation || 'South Africa',
      headline: reviewInput.headline || 'Verified Botanical Appraisal',
      rating: reviewInput.rating,
      comment: reviewInput.comment,
      verifiedPurchase: reviewInput.verifiedPurchase ?? true,
      date: reviewInput.date || 'Just now',
      helpfulCount: reviewInput.helpfulCount || 0,
    };
    all.unshift(review);
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(all));
    this.notify('reviews');
    return review;
  }

  public voteHelpful(reviewId: string): boolean {
    const all = this.getReviews();
    const match = all.find((r) => r.id === reviewId);
    if (!match) return false;
    match.helpfulCount = (match.helpfulCount || 0) + 1;
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(all));
    this.notify('reviews');
    return true;
  }

  // --- RELATED PRODUCTS ---
  public getRelatedProducts(productOrId: Product | string, limit = 3): Product[] {
    const all = this.getProducts();
    const product = typeof productOrId === 'string' ? all.find((p) => p.id === productOrId) : productOrId;
    if (!product) return all.slice(0, limit);
    return all
      .filter((p) => p.id !== product.id && (p.category === product.category || p.vendor === product.vendor))
      .slice(0, limit);
  }

  // --- STOCK & CUSTOM PRODUCTS ---
  public updateProductStock(id: string, newStock: number): boolean {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === id);
    if (!prod) return false;
    prod.stock = Math.max(0, newStock);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify('products');
    return true;
  }

  public addCustomProduct(newProduct: Omit<Product, 'id'>): Product {
    return this.addProduct(newProduct);
  }

  // --- DATABASE STATS & EXPORT ---
  public getDatabaseStats() {
    const products = this.getProducts();
    const orders = this.getOrders();
    const reviews = this.getReviews();
    const cart = this.getCart();
    const wishlist = this.getWishlist();
    const customers = this.getCustomers();

    const usedBytes = [
      localStorage.getItem(DB_KEYS.PRODUCTS) || '',
      localStorage.getItem(DB_KEYS.ORDERS) || '',
      localStorage.getItem(DB_KEYS.REVIEWS) || '',
      localStorage.getItem(DB_KEYS.CART) || '',
      localStorage.getItem(DB_KEYS.WISHLIST) || '',
      localStorage.getItem(DB_KEYS.USER) || '',
      localStorage.getItem(DB_KEYS.CUSTOMERS) || '',
      localStorage.getItem(DB_KEYS.SETTINGS) || '',
    ].join('').length;

    return {
      productsCount: products.length,
      totalProducts: products.length,
      ordersCount: orders.length,
      totalOrders: orders.length,
      reviewsCount: reviews.length,
      totalReviews: reviews.length,
      cartCount: cart.length,
      cartItemCount: cart.reduce((total, item) => total + item.quantity, 0),
      wishlistCount: wishlist.length,
      customersCount: customers.length,
      usedBytes,
      estimatedSizeBytes: usedBytes,
      engine: 'Free Reactive Local Engine',
      quotaBytes: 5 * 1024 * 1024,
      usedPercentage: Math.round((usedBytes / (5 * 1024 * 1024)) * 100),
    };
  }

  public exportDatabaseJSON(): string {
    return JSON.stringify(
      {
        products: this.getProducts(),
        orders: this.getOrders(),
        customers: this.getCustomers(),
        settings: this.getSettings(),
        reviews: this.getReviews(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  // --- RESET DB ---
  public resetToDefaults(): void {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(DB_KEYS.CART, JSON.stringify([]));
    localStorage.removeItem(DB_KEYS.ORDERS);
    localStorage.removeItem(DB_KEYS.USER);
    localStorage.removeItem(DB_KEYS.CUSTOMERS);
    localStorage.removeItem(DB_KEYS.WISHLIST);
    this.notify('*');
  }
}

export const dbService = new FreeDatabaseService();
