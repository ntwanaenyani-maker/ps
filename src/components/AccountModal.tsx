import React, { useState } from 'react';
import { UserAccount, Product, Currency, Order } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { apiService } from '../services/api';
import { X, User, Heart, Package, ShoppingBag, Trash2, LogOut, Loader2, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';

interface AccountModalProps {
  isOpen: boolean;
  currentUser: UserAccount | null;
  allProducts: Product[];
  currency: Currency;
  orders: Order[];
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  onRemoveFromWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onViewOrder: (order: Order) => void;
  onRequireAccount: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  currentUser,
  allProducts,
  currency,
  orders,
  onClose,
  onLogin,
  onLogout,
  onRemoveFromWishlist,
  onAddToCart,
  onViewOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'orders' | 'profile'>('wishlist');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');

  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const userWishlistProducts = currentUser
    ? allProducts.filter((p) => currentUser.wishlistIds.includes(p.id))
    : [];

  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customer.email.toLowerCase() === currentUser.email.toLowerCase() ||
          (!!o.customer.fullName && o.customer.fullName.toLowerCase() === currentUser.name.toLowerCase())
      )
    : [];

  const handleLoginFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      const user = await apiService.login(loginEmail.trim(), loginPassword);
      onLogin(user);
    } catch (error: any) {
      setAuthError(error.message || 'Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (registerPassword !== registerConfirm) {
      setAuthError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await apiService.register(registerName.trim(), registerEmail.trim(), registerPassword);
      onLogin(user);
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white border border-stone-200 shadow-2xl rounded-xs overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-900 text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_LOGO_IMAGE}
              alt="Phethagatsa Solutions Logo"
              className="h-10 w-auto object-contain rounded-md bg-white p-0.5 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wider text-white font-serif uppercase">
                  {currentUser ? currentUser.name : 'Collector Member Portal'}
                </h2>
                {currentUser && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded-xs">
                    {currentUser.memberTier}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-stone-400">
                {currentUser
                  ? `${currentUser.email} · Member since ${currentUser.memberSince}`
                  : 'Sign in or create an account to shop, save and track orders'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close account view"
            className="p-1.5 text-stone-400 hover:text-white rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentUser ? (
          <>
            {/* Account Tabs */}
            <div className="flex items-center gap-3 px-6 py-3 bg-stone-50 border-b border-stone-200 text-xs font-mono uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'wishlist' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${activeTab === 'wishlist' ? 'fill-white' : ''}`} />
                <span>Wishlist ({userWishlistProducts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'orders' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Orders ({userOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'profile' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {/* TAB 1: PERSONAL WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-950 font-serif">Personal Wishlist</h3>
                      <p className="text-xs font-mono text-stone-500">Saved pieces reserved to your profile.</p>
                    </div>
                  </div>

                  {userWishlistProducts.length > 0 ? (
                    <div className="divide-y divide-stone-200">
                      {userWishlistProducts.map((p) => (
                        <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xs border border-stone-200" />
                            <div>
                              <div className="text-[10px] font-mono uppercase text-stone-500">{p.category}</div>
                              <h4 className="text-sm font-semibold text-stone-900">{p.name}</h4>
                              <div className="text-xs font-mono font-medium text-stone-950 mt-0.5">
                                {formatPrice(p.price, currency)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onAddToCart(p)}
                              disabled={p.stock <= 0}
                              className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-mono uppercase rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Move to Bag</span>
                            </button>
                            <button
                              onClick={() => onRemoveFromWishlist(p.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center bg-stone-50 border border-dashed border-stone-200 rounded-xs">
                      <Heart className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-stone-800">Your personal wishlist is currently empty.</p>
                      <p className="text-xs text-stone-500 mt-1">Browse the collection and tap the heart on any piece.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ORDER HISTORY */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-950 font-serif">Order History</h3>
                      <p className="text-xs font-mono text-stone-500">Your consignment history and delivery status.</p>
                    </div>
                  </div>

                  {userOrders.length > 0 ? (
                    <div className="space-y-3">
                      {userOrders.map((ord) => (
                        <div key={ord.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xs text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-stone-900">#{ord.id}</span>
                              <span className="text-stone-400">·</span>
                              <span className="font-mono text-stone-500">{ord.createdAt}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold uppercase">
                              {ord.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-600 font-mono">
                            {ord.items.map((it) => `${it.product.name} (×${it.quantity})`).join(', ')}
                          </div>

                          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                            <span className="font-mono font-bold text-stone-950">Total: {formatPrice(ord.total, currency)}</span>
                            <button
                              onClick={() => {
                                onClose();
                                onViewOrder(ord);
                              }}
                              className="text-stone-700 hover:text-stone-950 font-mono underline cursor-pointer"
                            >
                              View Order →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center bg-stone-50 border border-dashed border-stone-200 rounded-xs">
                      <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                      <p className="text-xs text-stone-600 font-mono">No order history recorded yet.</p>
                      <p className="text-[11px] text-stone-400 mt-1">Complete a checkout to record your first order.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6 max-w-lg text-xs font-mono">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase">Member Name</div>
                      <div className="text-stone-950 font-semibold text-sm">{currentUser.name}</div>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase">Registered Email</div>
                      <div className="text-stone-950 font-semibold">{currentUser.email}</div>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase">Loyalty Points</div>
                      <div className="text-stone-950 font-semibold">{currentUser.loyaltyPoints}</div>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Account</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Auth Mode Tabs */}
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-center gap-4 text-xs font-mono uppercase tracking-wider">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`px-4 py-2 rounded-xs transition-colors cursor-pointer ${
                  authMode === 'login' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`px-4 py-2 rounded-xs transition-colors cursor-pointer ${
                  authMode === 'register' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {authError && (
                <div className="mx-8 mt-6 p-3 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs">{authError}</div>
              )}

              {/* Login Form */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginFormSubmit} className="p-8 max-w-md mx-auto my-auto w-full space-y-3.5 text-xs">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-stone-950 font-serif">Welcome Back</h3>
                    <p className="text-xs text-stone-500 font-mono mt-1">Sign in with your email and password.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-white font-mono uppercase tracking-wider text-xs font-medium rounded-xs transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Signing In…
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" /> Sign In
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-stone-400 font-mono text-center pt-2 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                    Secured with encrypted passwords & server sessions
                  </p>
                </form>
              )}

              {/* Register Form */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterFormSubmit} className="p-8 max-w-md mx-auto my-auto w-full space-y-3.5 text-xs">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-stone-950 font-serif">Create Your Account</h3>
                    <p className="text-xs text-stone-500 font-mono mt-1">Join in seconds — shop, save & earn loyalty points.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Thabo Mokoena"
                      autoComplete="name"
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={registerConfirm}
                      onChange={(e) => setRegisterConfirm(e.target.value)}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-white font-mono uppercase tracking-wider text-xs font-medium rounded-xs transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Creating Account…
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" /> Create Account
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
