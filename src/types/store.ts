export type Category =
  | 'all'
  | 'face-care'
  | 'body-care'
  | 'hair-care'
  | 'bundles'
  | 'skincare'
  | 'skincare-kits'
  | 'supplements'
  | 'exfoliator'
  | 'superfood';

export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  colorHex?: string;
  inStock: boolean;
  sku?: string;
  price?: number;
  grams?: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  authorLocation?: string;
  headline?: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedPurchase: boolean;
  date: string;
  helpfulCount?: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  memberTier: 'Bronze' | 'Silver' | 'Gold' | 'VIP Radiant' | 'Admin';
  loyaltyPoints: number;
  totalOrdersCount: number;
  memberSince: string;
  wishlistIds: string[];
}

export interface Product {
  id: string;
  handle?: string;
  name: string;
  tagline: string;
  category: Category;
  vendor?: string;
  type?: string;
  tags?: string[];
  sku?: string;
  grams?: number;
  price: number;
  currency: string;
  originalPrice?: number;
  image: string;
  additionalImages?: string[];
  description: string;
  bodyHtml?: string;
  howToUse?: string;
  ingredients?: string;
  benefits?: string[];
  details: string[];
  dimensions?: string;
  materials?: string;
  artisan?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  edition: string;
  featured?: boolean;
  variants: ProductVariant[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'confirmed' | 'crafting' | 'dispatched';

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  postalCode: string;
  country: string;
}

export interface OrderTimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: 'card' | 'instant-eft' | 'payfast' | 'cod' | 'wire';
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  timeline?: OrderTimelineEvent[];
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  whatsappNumber: string;
  currency: string;
  paymentGateway: string;
  defaultShipping: number;
  freeShippingThreshold: number;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  salesGrowthPct: number;
  monthlySales: { month: string; sales: number; orders: number }[];
}

export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rate: number;
}

