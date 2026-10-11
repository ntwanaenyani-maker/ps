import { UserAccount, Order, Product } from '../types/store';

const TOKEN_KEY = 'phethagatsa_auth_token';

// Base URL of the API server. Empty in dev (Vite proxies /api to the backend).
// In production set VITE_API_URL to the deployed API host, e.g.
//   VITE_API_URL=ecommerce-server-w9bv.onrender.com  (https:// is inferred)
const RAW_API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const API_BASE = RAW_API_BASE
  ? (RAW_API_BASE.startsWith('http') ? RAW_API_BASE : `https://${RAW_API_BASE}`).replace(/\/+$/, '')
  : '';

export interface ApiUser extends Omit<UserAccount, 'wishlistIds' | 'id' | 'memberTier' | 'memberSince'> {
  id: string;
  memberTier: string;
  memberSince: string;
  wishlist: string[];
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    const message =
      (data as { error?: string })?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

function mapApiUserToAccount(u: ApiUser): UserAccount {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? undefined,
    address: u.address ?? undefined,
    city: u.city ?? undefined,
    province: u.province ?? undefined,
    postalCode: u.postalCode ?? undefined,
    memberTier: (u.memberTier as UserAccount['memberTier']) || 'Bronze',
    loyaltyPoints: u.loyaltyPoints ?? 0,
    totalOrdersCount: u.totalOrdersCount ?? 0,
    memberSince: u.memberSince ?? 'Just now',
    wishlistIds: Array.isArray(u.wishlist) ? u.wishlist : [],
  };
}

export interface CheckoutPayload {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province?: string;
    postalCode: string;
    country?: string;
  };
  items: {
    productId: string;
    name: string;
    variantId?: string;
    variantName?: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  currency?: string;
  paymentMethod?: string;
}

export const apiService = {
  // ---- AUTH ----
  async register(name: string, email: string, password: string, phone?: string): Promise<UserAccount> {
    const data = await request<{ user: ApiUser; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    setToken(data.token);
    return mapApiUserToAccount(data.user);
  },

  async login(email: string, password: string): Promise<UserAccount> {
    const data = await request<{ user: ApiUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return mapApiUserToAccount(data.user);
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setToken(null);
    }
  },

  async me(): Promise<UserAccount | null> {
    if (!getToken()) return null;
    try {
      const data = await request<{ user: ApiUser }>('/api/auth/me');
      return mapApiUserToAccount(data.user);
    } catch {
      setToken(null);
      return null;
    }
  },

  // ---- PRODUCTS ----
  async getProducts(): Promise<Product[]> {
    const data = await request<{ products: Product[] }>('/api/products');
    return data.products;
  },

  // ---- ORDERS ----
  async createOrder(payload: CheckoutPayload): Promise<Order> {
    const data = await request<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.order;
  },

  async getMyOrders(): Promise<Order[]> {
    const data = await request<{ orders: Order[] }>('/api/orders/mine');
    return data.orders;
  },

  async lookupOrder(ref: string): Promise<Order | null> {
    try {
      const data = await request<{ order: Order }>(`/api/orders/${encodeURIComponent(ref.trim())}`);
      return data.order;
    } catch {
      return null;
    }
  },

  // ---- PAYMENTS (Paystack-ready) ----
  async initializePayment(params: {
    email: string;
    amount: number;
    orderNumber?: string;
  }): Promise<{ paystackConfigured: boolean; authorizationUrl?: string; message?: string }> {
    return request('/api/pay/initialize', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
