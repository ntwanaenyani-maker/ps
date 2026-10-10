import React, { useState } from 'react';
import { UserAccount, Product, Currency, Order } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { dbService } from '../services/db';
import { X, User, Heart, Package, ShoppingBag, Trash2, LogOut, CheckCircle, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';

interface AccountModalProps {
  isOpen: boolean;
  currentUser: UserAccount | null;
  allProducts: Product[];
  currency: Currency;
  onClose: () => void;
  onLogin: (name: string, email: string) => void;
  onLogout: () => void;
  onRemoveFromWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onViewOrder: (order: Order) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  currentUser,
  allProducts,
  currency,
  onClose,
  onLogin,
  onLogout,
  onRemoveFromWishlist,
  onAddToCart,
  onViewOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'orders' | 'profile'>('wishlist');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state - defaults to South African account
  const [loginName, setLoginName] = useState('Fidel Kekana');
  const [loginEmail, setLoginEmail] = useState('fidelkekana@gmail.com');
  const [loginPassword, setLoginPassword] = useState('dota');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const userWishlistProducts = currentUser
    ? allProducts.filter((p) => currentUser.wishlistIds.includes(p.id))
    : [];

  const userOrders = dbService.getOrders();

  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      if (loginName.trim() && loginEmail.trim()) {
        try {
          onLogin(loginName, loginEmail, loginPassword);
        } catch (error: any) {
          setLoginError(error.message || 'Authentication failed');
        }
      }
    } else {
      // Registration
      if (registerName.trim() && registerEmail.trim() && registerPassword.trim()) {
        if (registerPassword !== registerConfirm) {
          setRegisterError('Passwords do not match');
          return;
        }
        try {
          const newUser = dbService.registerUser(registerName.trim(), registerEmail.trim().toLowerCase(), registerPassword);
          setRegisterError('');
          setLoginError('');
          setAuthMode('login');
          // Auto-login the new user
          onLogin(newUser.name, newUser.email, registerPassword);
        } catch (error: any) {
          setRegisterError(error.message || 'Registration failed');
        }
      }
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
                {currentUser ? `${currentUser.email} · Member since ${currentUser.memberSince}` : 'Sign in to access personal wishlist and order ledger'}
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
                <span>Personal Wishlist ({userWishlistProducts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'orders' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Orders Ledger ({userOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'profile' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Member Profile</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {/* TAB 1: PERSONAL WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-950 font-serif">
                        Personal Wishlist
                      </h3>
                      <p className="text-xs font-mono text-stone-500">
                        Reserved objects curated under your collector profile.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-stone-700">
                      {userWishlistProducts.length} items saved
                    </span>
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
                              <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                                {p.stock > 0 ? `${p.stock} remaining in atelier` : 'Sold out'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onAddToCart(p)}
                              disabled={p.stock <= 0}
                              className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-850 disabled:bg-stone-300 text-white text-xs font-mono uppercase rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                      <p className="text-xs text-stone-500 mt-1">Browse the collection and tap the 'Add to Wishlist' button on any piece.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ORDER HISTORY */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-950 font-serif">
                        Personal Orders Ledger
                      </h3>
                      <p className="text-xs font-mono text-stone-500">
                        Authenticated consignment history and delivery status.
                      </p>
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
                              <span className="font-mono text-stone-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold uppercase">
                              {ord.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-600 font-mono">
                            {ord.items.map((it) => `${it.product.name} (×${it.quantity})`).join(', ')}
                          </div>

                          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                            <span className="font-mono font-bold text-stone-950">
                              Total: {formatPrice(ord.total, currency)}
                            </span>
                            <button
                              onClick={() => {
                                onClose();
                                onViewOrder(ord);
                              }}
                              className="text-stone-700 hover:text-stone-950 font-mono underline cursor-pointer"
                            >
                              Inspect Tracking Receipt →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center bg-stone-50 border border-dashed border-stone-200 rounded-xs">
                      <p className="text-xs text-stone-600 font-mono">No order history recorded yet.</p>
                      <p className="text-[11px] text-stone-400 mt-1">Complete a checkout to record your first consignment.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6 max-w-lg text-xs font-mono">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase">Collector Name</div>
                      <div className="text-stone-950 font-semibold text-sm">{currentUser.name}</div>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase">Registered Email</div>
                      <div className="text-stone-950 font-semibold">{currentUser.email}</div>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase">Atelier Tier</div>
                      <div className="text-stone-950 font-semibold">{currentUser.memberTier}</div>
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
                  <>
            {/* Auth Mode Tabs */}
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-center gap-4 text-xs font-mono uppercase tracking-wider">
              <button
                onClick={() => setAuthMode('login')}
                className={`px-4 py-2 rounded-xs transition-colors cursor-pointer ${
                  authMode === 'login' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`px-4 py-2 rounded-xs transition-colors cursor-pointer ${
                  authMode === 'register' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Login Form */}
            {authMode === 'login' && (
              <div className="p-8 max-w-md mx-auto my-auto w-full">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-stone-950 font-serif">
                    Sign In to Member Profile
                  </h3>
                  <p className="text-xs text-stone-500 font-mono mt-1">
                    Access your personal architectural wishlist and registered orders across sessions.
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginFormSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="e.g. Julian Mercer"
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="collector@atelier.design"
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
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-stone-950 hover:bg-stone-850 text-white font-mono uppercase tracking-wider text-xs font-medium rounded-xs transition-colors cursor-pointer mt-4"
                  >
                    Sign In / Access Wishlist
                  </button>

                  <p className="text-[10px] text-stone-400 font-mono text-center pt-2">
                    Simulated authenticated collector account with local database persistence.
                  </p>
                </form>
              </div>
            )}

            {/* Register Form */}
            {authMode === 'register' && (
              <div className="p-8 max-w-md mx-auto my-auto w-full">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-stone-950 font-serif">
                    Create New Account
                  </h3>
                  <p className="text-xs text-stone-500 font-mono mt-1">
                    Join our exclusive collector community with instant access.
                  </p>
                </div>

                {registerError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs">
                    {registerError}
                  </div>
                )}

                <form onSubmit={handleLoginFormSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Julian Mercer"
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
                      placeholder="collector@atelier.design"
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Create a password"
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
                      className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-stone-950 hover:bg-stone-850 text-white font-mono uppercase tracking-wider text-xs font-medium rounded-xs transition-colors cursor-pointer mt-4"
                  >
                    Create Account
                  </button>
                </form>
              </div>
            )}
      </div>
    </div>
  );
};
