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
  const extra = (options as { headers?: Record<string, string> }).headers;
  if (extra) Object.assign(headers, extra);

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

  async googleLogin(credential: string): Promise<UserAccount> {
    const data = await request<{ user: ApiUser; token: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
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

  // ---- PASSWORD RESET (email OTP) ----
  async requestOtp(email: string, purpose: 'reset_password' | 'verify_email' = 'reset_password'): Promise<void> {
    await request('/api/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
  },

  async verifyOtp(
    email: string,
    code: string,
    purpose: 'reset_password' | 'verify_email' = 'reset_password'
  ): Promise<{ verified: boolean }> {
    return request('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await request('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
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

  // ---- PAYMENTS (PayPal Orders v2) ----
  async paypalStatus(): Promise<{ paypalConfigured: boolean }> {
    return request('/api/pay/paypal/status');
  },

  async createPayPalOrder(params: {
    amount: number;
    currency?: string;
    orderNumber?: string;
  }): Promise<{ id: string }> {
    return request('/api/pay/paypal/create', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async capturePayPalOrder(params: {
    orderId: string;
    orderNumber?: string;
  }): Promise<{ status: string; id: string; captured: boolean }> {
    return request('/api/pay/paypal/capture', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // ---- PAYMENTS (Stitch Pay by Bank) ----
  async stitchStatus(): Promise<{ stitchConfigured: boolean; env: string }> {
    return request('/api/pay/stitch/status');
  },

  async createStitchPayment(params: {
    amount: number;
    currency?: string;
    orderNumber?: string;
    payerName?: string;
    payerEmail?: string;
    payerPhone?: string;
    returnUrl?: string;
  }): Promise<{ id: string; url: string; redirectUrl: string; externalReference: string }> {
    return request('/api/pay/stitch/create', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async confirmStitchPayment(params: {
    paymentRequestId: string;
    orderNumber?: string;
  }): Promise<{ state: string; completed: boolean; orderNumber: string | null }> {
    return request('/api/pay/stitch/confirm', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async simulateStitchPayment(params: {
    paymentRequestId: string;
  }): Promise<{ simulated: boolean }> {
    return request('/api/pay/stitch/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
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

  // ---- PAYMENT METHODS (public) ----
  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    const data = await request<{ success: boolean; data: PaymentMethodsResponse }>('/api/payment-methods');
    return data.data;
  },

  // ---- ADMIN ----
  async verifyAdminKey(key: string): Promise<boolean> {
    try {
      await request('/api/admin/secure-access', { headers: { 'X-API-Key': key } });
      return true;
    } catch {
      return false;
    }
  },

  async getAdminGateways(key: string): Promise<AdminGatewaysResponse> {
    const data = await request<{ success: boolean; data: AdminGateway[]; webhooks: AdminGatewaysResponse['webhooks'] }>(
      '/api/admin/gateways',
      { headers: { 'X-API-Key': key } }
    );
    return { gateways: data.data, webhooks: data.webhooks };
  },

  async updateAdminGateways(
    key: string,
    toggles: Record<string, boolean>
  ): Promise<Record<string, { enabled: boolean }>> {
    const body: Record<string, { enabled: boolean }> = {};
    Object.entries(toggles).forEach(([id, enabled]) => {
      body[id] = { enabled: Boolean(enabled) };
    });
    const data = await request<{ success: boolean; data: Record<string, { enabled: boolean }> }>(
      '/api/admin/gateways',
      { method: 'PUT', headers: { 'X-API-Key': key }, body: JSON.stringify(body) }
    );
    return data.data;
  },
};

export const adminService = {
  verifyAdminKey: (key: string): Promise<boolean> => apiService.verifyAdminKey(key),
  getAdminGateways: (key: string): Promise<AdminGatewaysResponse> => apiService.getAdminGateways(key),
  updateAdminGateways: (key: string, toggles: Record<string, boolean>) =>
    apiService.updateAdminGateways(key, toggles),
};

export interface PaymentMethodState {
  enabled: boolean;
  configured: boolean;
}

export interface PaymentMethodsResponse {
  paypal: PaymentMethodState;
  stitch: PaymentMethodState;
  paystack: PaymentMethodState;
  eft: PaymentMethodState;
  cod: PaymentMethodState;
}

export interface AdminGateway {
  id: string;
  label: string;
  mode: string;
  enabled: boolean;
  configured: boolean;
}

export interface AdminGatewaysResponse {
  gateways: AdminGateway[];
  webhooks: { paypal: { url: string; configured: boolean } };
}
