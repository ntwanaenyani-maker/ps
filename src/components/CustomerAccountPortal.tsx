import React, { useState } from 'react';
import { UserAccount, Order, Product } from '../types/store';
import { dbService } from '../services/db';
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Truck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface CustomerAccountPortalProps {
  currentUser: UserAccount;
  allProducts: Product[];
  orders?: Order[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onLogout: () => void;
}

export const CustomerAccountPortal: React.FC<CustomerAccountPortalProps> = ({
  currentUser,
  allProducts,
  orders: serverOrders,
  onClose,
  onAddToCart,
  onSelectProduct,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'order-detail' | 'wishlist' | 'settings' | 'help'>('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [userProfile, setUserProfile] = useState<UserAccount>(currentUser);

  // Settings form
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '+27 82 123 4567',
    address: currentUser.address || '123 Main Street',
    city: currentUser.city || 'Pretoria',
    province: currentUser.province || 'Gauteng',
    postalCode: currentUser.postalCode || '0123',
    currentPassword: '',
    newPassword: '',
  });

  const localOrders = dbService.getOrders();
  const orders = serverOrders && serverOrders.length > 0
    ? serverOrders
    : localOrders.filter(
        (o) => o.customer.email.toLowerCase() === currentUser.email.toLowerCase() || o.customer.fullName.toLowerCase() === currentUser.name.toLowerCase()
      );

  const wishlistProducts = allProducts.filter((p) => currentUser.wishlistIds.includes(p.id));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dbService.updateCurrentUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
    });
    if (updated) {
      setUserProfile(updated);
      alert('Account details successfully updated!');
    }
  };

  const handleOpenOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setActiveTab('order-detail');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-4xl bg-stone-50 h-full flex flex-col md:flex-row shadow-2xl overflow-hidden animate-slideIn">
        {/* Left Sidebar Menu (Matches Screen 7-11) */}
        <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-6 flex flex-col justify-between shrink-0">
          <div>
            {/* User Greeting */}
            <div className="flex items-center gap-3 pb-6 border-b border-stone-200">
              <div className="w-12 h-12 rounded-full bg-emerald-900 text-emerald-100 flex items-center justify-center font-serif text-lg font-bold">
                {userProfile.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-stone-900 truncate font-serif text-sm">
                  {userProfile.name}
                </div>
                <div className="text-[11px] font-mono text-stone-500 truncate">
                  {userProfile.email}
                </div>
                <div className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-mono uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {userProfile.memberTier} Member
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="mt-6 space-y-1 text-xs font-mono uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-emerald-900 text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs transition-colors cursor-pointer ${
                  activeTab === 'orders' || activeTab === 'order-detail'
                    ? 'bg-emerald-900 text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs transition-colors cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-emerald-900 text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  <span>My Wishlist</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-mono">
                  {currentUser.wishlistIds.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-emerald-900 text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs transition-colors cursor-pointer ${
                  activeTab === 'help'
                    ? 'bg-emerald-900 text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-stone-200 space-y-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-rose-700 hover:bg-rose-50 rounded-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          {/* TAB 1: OVERVIEW (Screen 7) */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-serif">
                  Welcome back, {userProfile.name.split(' ')[0]}!
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Here is your South African botanical skincare account overview.
                </p>
              </div>

              {/* 3 Metric Cards (Screen 7) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-stone-200 rounded-xs shadow-2xs">
                  <div className="text-xs font-mono text-stone-500 uppercase">Total Orders</div>
                  <div className="text-3xl font-bold font-mono text-stone-950 mt-2">
                    {orders.length}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-mono mt-1">Nationwide deliveries</div>
                </div>

                <div className="p-5 bg-white border border-stone-200 rounded-xs shadow-2xs">
                  <div className="text-xs font-mono text-stone-500 uppercase">Wishlist Items</div>
                  <div className="text-3xl font-bold font-mono text-rose-700 mt-2">
                    {currentUser.wishlistIds.length}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono mt-1">Saved formulas</div>
                </div>

                <div className="p-5 bg-white border border-stone-200 rounded-xs shadow-2xs">
                  <div className="text-xs font-mono text-stone-500 uppercase">Loyalty Points</div>
                  <div className="text-3xl font-bold font-mono text-amber-600 mt-2">
                    {userProfile.loyaltyPoints}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono mt-1">R{(userProfile.loyaltyPoints * 0.25).toFixed(2)} store credit value</div>
                </div>
              </div>

              {/* Recent Orders Table (Screen 7) */}
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-stone-950 font-serif">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-mono text-emerald-800 hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                {orders.length > 0 ? (
                  <div className="divide-y divide-stone-100">
                    {orders.slice(0, 3).map((o) => (
                      <div
                        key={o.id}
                        onClick={() => handleOpenOrderDetail(o)}
                        className="py-3 flex items-center justify-between hover:bg-stone-50 px-2 rounded cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-mono font-bold text-xs text-stone-900">#{o.id}</div>
                          <div className="text-[11px] font-mono text-stone-500">{o.createdAt}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-stone-900">R{o.total.toFixed(2)}</div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                              o.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-900'
                                : o.status === 'shipped'
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 font-mono py-4">No orders placed yet.</p>
                )}
              </div>

              {/* Promo Banner (Screen 7) */}
              <div className="p-6 rounded-xs bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                    VIP Radiant Rewards
                  </span>
                  <h4 className="text-lg font-bold font-serif mt-1">Healthy Skin, Happy You</h4>
                  <p className="text-xs text-emerald-200 font-sans mt-0.5">
                    Explore our pediatrician-tested eczema balm and radiant collagen elixirs.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white text-emerald-950 text-xs font-mono font-bold uppercase rounded-xs hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  Shop Now
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS LIST */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-950 font-serif">
                  My Orders History
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Click any order to view live door-to-door courier tracking and dispatch details.
                </p>
              </div>

              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => handleOpenOrderDetail(o)}
                    className="p-5 bg-white border border-stone-200 rounded-xs hover:border-emerald-800/40 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                      <div>
                        <span className="font-mono font-bold text-sm text-stone-950">Order #{o.id}</span>
                        <div className="text-xs font-mono text-stone-500">{o.createdAt}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold ${
                            o.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : o.status === 'shipped'
                              ? 'bg-sky-100 text-sky-900 border border-sky-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {o.status}
                        </span>
                        <span className="text-sm font-mono font-bold text-stone-950">
                          R{o.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs text-stone-600">
                      <div>
                        {o.items.length} {o.items.length === 1 ? 'item' : 'items'}:{' '}
                        {o.items.map((i) => i.product.name).join(', ')}
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDER DETAILS WITH TIMELINE (Screen 8) */}
          {activeTab === 'order-detail' && selectedOrder && (
            <div className="space-y-6">
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-mono text-emerald-800 hover:underline cursor-pointer"
              >
                ← Back to All Orders
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold font-serif text-stone-950">
                      Order #{selectedOrder.id}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold ${
                        selectedOrder.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-sky-100 text-sky-900'
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-stone-500 mt-1">
                    Placed {selectedOrder.createdAt} · Total: R{selectedOrder.total.toFixed(2)}
                  </p>
                </div>

                <a
                  href={`https://wa.me/27723819402?text=Hello%20Phethagatsa%20Concierge!%20I'm%20inquiring%20about%20my%20order%20%23${selectedOrder.id}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xs text-xs font-mono font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Contact Support</span>
                </a>
              </div>

              {/* Order Timeline (Screen 8) */}
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-2xs">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-stone-900 mb-6">
                  Order Timeline & Courier Status
                </h3>

                <div className="space-y-6 relative pl-6 border-l-2 border-emerald-900/20 ml-3">
                  {(selectedOrder.timeline || [
                    { title: 'Order Placed', description: 'Order verified', timestamp: selectedOrder.createdAt, completed: true },
                    { title: 'Processing', description: 'Formulations prepared & sanitized at Pretoria lab', timestamp: 'In Progress', completed: selectedOrder.status !== 'pending' },
                    { title: 'Shipped', description: 'Dispatched with The Courier Guy', timestamp: 'Pending', completed: selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' },
                    { title: 'Delivered', description: 'Signed and delivered at doorstep', timestamp: 'Pending', completed: selectedOrder.status === 'delivered' },
                  ]).map((event, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          event.completed
                            ? 'bg-emerald-800 text-white'
                            : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-950 font-mono uppercase">
                          {event.title}
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5">{event.description}</div>
                        <div className="text-[10px] font-mono text-stone-400 mt-0.5">{event.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items List (Screen 8) */}
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-2xs">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-stone-900 mb-4">
                  Items ({selectedOrder.items.length})
                </h3>

                <div className="divide-y divide-stone-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded object-cover border border-stone-200"
                        />
                        <div>
                          <div className="font-bold text-xs text-stone-950">{item.product.name}</div>
                          <div className="text-[11px] font-mono text-stone-500">
                            Qty: {item.quantity} · {item.selectedVariant?.name || 'Standard'}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-xs text-stone-950">
                        R{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white border border-stone-200 rounded-xs p-6 shadow-2xs">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-stone-900 mb-2">
                  Shipping Address
                </h3>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  <strong>{selectedOrder.customer.fullName}</strong><br />
                  {selectedOrder.customer.address}<br />
                  {selectedOrder.customer.city}, {selectedOrder.customer.province}, {selectedOrder.customer.postalCode}<br />
                  South Africa · Phone: {selectedOrder.customer.phone}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: MY WISHLIST (Screen 9) */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-950 font-serif">
                  My Saved Wishlist
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Formulations and superfoods saved to your personal collection.
                </p>
              </div>

              {wishlistProducts.length > 0 ? (
                <div className="space-y-4">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-white border border-stone-200 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <img src={p.image} alt={p.name} className="w-14 h-14 rounded object-cover" />
                        <div>
                          <h4 className="font-bold text-xs text-stone-950 hover:text-emerald-800 transition-colors">
                            {p.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-emerald-800">
                            R{p.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAddToCart(p)}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xs text-xs font-mono font-medium transition-colors cursor-pointer"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => dbService.toggleWishlist(p.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-stone-200 rounded-xs">
                  <p className="text-xs text-stone-500 font-mono">Your saved wishlist is empty.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACCOUNT SETTINGS (Screen 10) */}
          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-950 font-serif">
                  Account Settings
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Manage your personal shipping address, contact details, and password.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-white border border-stone-200 rounded-xs p-6 shadow-2xs space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 text-xs text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-700 mb-1">Phone Number (+27)</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 text-xs text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-700 mb-1">Default Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 text-xs text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-700 mb-1">Province</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 text-xs text-stone-900 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-mono uppercase font-bold rounded transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: HELP & SUPPORT (Screen 11) */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-950 font-serif">
                  Help & Concierge Support
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Reach our registered pharmacists and care specialists immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="https://wa.me/27723819402?text=Hello%20Phethagatsa%20Concierge!%20I%20need%20skincare%20or%20delivery%20assistance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 bg-white border border-stone-200 rounded-xs hover:border-emerald-800 transition-all flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800">
                      Live WhatsApp Chat
                    </h4>
                    <p className="text-[11px] text-stone-500 font-sans">
                      Connect with a botanical consultant (08:00–18:00 SAST)
                    </p>
                  </div>
                </a>

                <div className="p-5 bg-white border border-stone-200 rounded-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">
                      Returns & 30-Day Guarantee
                    </h4>
                    <p className="text-[11px] text-stone-500 font-sans">
                      Free return collection arranged from your door
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
