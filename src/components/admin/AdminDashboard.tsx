import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { Product, Order, UserAccount, StoreSettings, AdminAnalytics, OrderStatus, Category } from '../../types/store';
import { BRAND_LOGO_IMAGE } from '../../data/initialProducts';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  Search,
  X,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface AdminDashboardProps {
  onSwitchToStorefront?: () => void;
  onOpenProductView?: (product: Product) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSwitchToStorefront,
  onOpenProductView,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'reports' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserAccount[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(dbService.getSettings());
  const [analytics, setAnalytics] = useState<AdminAnalytics>(dbService.getAnalytics());

  // Search & Filter state
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Add/Edit Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'face-care' as Category,
    price: 199,
    stock: 50,
    tagline: '',
    description: '',
    image: '',
    sku: '',
  });

  const loadData = () => {
    setProducts(dbService.getProducts());
    setOrders(dbService.getOrders());
    setCustomers(dbService.getCustomers());
    setSettings(dbService.getSettings());
    setAnalytics(dbService.getAnalytics());
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe('*', loadData);
    return () => unsub();
  }, []);

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    dbService.updateOrderStatus(orderId, status);
    loadData();
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the live catalog?`)) {
      dbService.deleteProduct(id);
      loadData();
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      dbService.updateProduct({
        ...editingProduct,
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        tagline: productForm.tagline,
        description: productForm.description,
        image: productForm.image || editingProduct.image,
        sku: productForm.sku,
      });
    } else {
      dbService.addProduct({
        name: productForm.name,
        tagline: productForm.tagline || 'Clean botanical formula crafted with South African botanicals',
        category: productForm.category,
        price: Number(productForm.price),
        currency: 'ZAR',
        stock: Number(productForm.stock),
        sku: productForm.sku || `PS-${Math.floor(1000 + Math.random() * 9000)}`,
        image: productForm.image || products[0]?.image || '',
        description: productForm.description || 'Deeply restorative daily formula.',
        details: ['Clinically formulated in South Africa', '100% natural cold-pressed botanicals'],
        dimensions: '50ml',
        materials: 'Pure African Botanicals',
        artisan: 'Phethagatsa Labs, Pretoria',
        rating: 5.0,
        reviewCount: 1,
        edition: 'Botanical Release',
        featured: false,
        variants: [
          { id: `v-${Date.now()}`, name: 'Standard Size', inStock: true, price: Number(productForm.price) },
        ],
      });
    }
    setIsAddProductOpen(false);
    setEditingProduct(null);
    setProductForm({ name: '', category: 'face-care', price: 199, stock: 50, tagline: '', description: '', image: '', sku: '' });
    loadData();
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      tagline: prod.tagline,
      description: prod.description,
      image: prod.image,
      sku: prod.sku || '',
    });
    setIsAddProductOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateSettings(settings);
    alert('Store settings successfully updated in live database!');
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    return true;
  });

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.city && c.city.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-[#0f1713] text-stone-100 flex flex-col md:flex-row font-sans">
      {/* Dark Sidebar (Matches Screen 13) */}
      <aside className="w-full md:w-64 bg-[#14221a] border-r border-emerald-900/30 flex flex-col shrink-0">
        {/* Brand Logo & Wordmark */}
        <div className="p-6 border-b border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_LOGO_IMAGE}
              alt="Phethagatsa Solutions"
              className="h-10 w-auto object-contain rounded-md bg-white/95 p-1"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="text-sm font-bold tracking-tight text-white font-serif uppercase">
                Phethagatsa
              </div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                Admin Console
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Products</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Orders</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Customers</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Reports & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-stone-300 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Store Settings</span>
          </button>
        </nav>

        {/* Back to Customer Storefront Button */}
        <div className="p-4 border-t border-emerald-900/30">
          <button
            onClick={onSwitchToStorefront}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm font-mono"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Customer Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 overflow-y-auto bg-[#0f1713] p-6 sm:p-8 lg:p-10">
        {/* Top workspace bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-emerald-900/30">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif capitalize">
              {activeTab === 'dashboard' ? 'Executive Dashboard' : activeTab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-stone-400 font-mono mt-1">
              Live operations · Pretoria & Johannesburg Logistics Node · Database Status: Active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              title="Sync with Live Persistent DB"
              className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {activeTab === 'products' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', category: 'face-care', price: 199, stock: 50, tagline: '', description: '', image: '', sku: '' });
                  setIsAddProductOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 pt-6">
            {/* KPI Cards (Matches Mockup Screen 13) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-xl bg-[#14221a] border border-emerald-900/40 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
                  <span>Total Orders</span>
                  <span className="flex items-center text-emerald-400 font-semibold gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +12%
                  </span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-white font-mono">
                  {analytics.totalOrders}
                </div>
                <div className="text-[11px] text-stone-500 font-mono mt-1">Processed nationwide</div>
              </div>

              <div className="p-5 rounded-xl bg-[#14221a] border border-emerald-900/40 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
                  <span>Total Revenue</span>
                  <span className="flex items-center text-emerald-400 font-semibold gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +16%
                  </span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-emerald-300 font-mono">
                  R{analytics.totalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-500 font-mono mt-1">Currency: ZAR (South Africa)</div>
              </div>

              <div className="p-5 rounded-xl bg-[#14221a] border border-emerald-900/40 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
                  <span>Total Customers</span>
                  <span className="flex items-center text-emerald-400 font-semibold gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +10%
                  </span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-white font-mono">
                  {analytics.totalCustomers}
                </div>
                <div className="text-[11px] text-stone-500 font-mono mt-1">Verified loyalty accounts</div>
              </div>

              <div className="p-5 rounded-xl bg-[#14221a] border border-emerald-900/40 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
                  <span>Catalog Products</span>
                  <span className="text-emerald-400 font-mono text-xs">Active</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-white font-mono">
                  {analytics.totalProducts}
                </div>
                <div className="text-[11px] text-stone-500 font-mono mt-1">Formulations & bundles</div>
              </div>
            </div>

            {/* Sales Performance Visual Chart (Screen 13) */}
            <div className="p-6 rounded-xl bg-[#14221a] border border-emerald-900/40">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white font-serif">Sales Overview & Growth</h3>
                  <p className="text-xs text-stone-400 font-mono">Monthly order revenue trajectory in ZAR</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/40">
                  Avg Order: R{analytics.averageOrderValue}
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-emerald-900/30">
                {analytics.monthlySales.map((m, idx) => {
                  const maxSales = 30000;
                  const heightPct = Math.round((m.sales / maxSales) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-mono text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        R{m.sales.toLocaleString()}
                      </div>
                      <div className="w-full max-w-[48px] bg-emerald-900/40 rounded-t-md overflow-hidden relative h-36 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 transition-all duration-700 rounded-t-md group-hover:brightness-110"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-stone-400">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-xl bg-[#14221a] border border-emerald-900/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white font-serif">Recent Live Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-emerald-900/40 text-stone-400 font-mono uppercase text-[10px]">
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Total</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-emerald-900/10">
                        <td className="py-3 font-mono font-bold text-emerald-300">#{o.id}</td>
                        <td className="py-3 text-stone-200">{o.customer.fullName}</td>
                        <td className="py-3 font-mono text-white">R{o.total.toFixed(2)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold ${
                              o.status === 'delivered'
                                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                                : o.status === 'shipped'
                                ? 'bg-sky-900/80 text-sky-200 border border-sky-700'
                                : o.status === 'processing'
                                ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                                : 'bg-stone-800 text-stone-300 border border-stone-600'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <a
                            href={`https://wa.me/${o.customer.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              o.customer.fullName
                            )}%2C%20this%20is%20Phethagatsa%20Solutions%20regarding%20order%20%23${o.id}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE PRODUCTS (Matches Screen 14) */}
        {activeTab === 'products' && (
          <div className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU..."
                  className="w-full bg-[#14221a] border border-emerald-900/50 rounded-lg py-2 pl-9 pr-4 text-xs font-sans text-white placeholder-stone-500 focus:outline-none focus:border-emerald-600"
                />
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-xs font-mono text-stone-400 self-end sm:self-auto">
                Showing {filteredProducts.length} formulas
              </span>
            </div>

            <div className="rounded-xl bg-[#14221a] border border-emerald-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-emerald-900/50 bg-[#0f1713]/80 text-stone-400 font-mono uppercase text-[10px]">
                      <th className="py-3 px-4">Formula</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (ZAR)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-emerald-900/10">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-md object-cover border border-emerald-900/40 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-white leading-snug">{p.name}</div>
                            <div className="text-[10px] font-mono text-stone-400">SKU: {p.sku || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-300 capitalize">{p.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-300">
                          R{p.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono text-white">{p.stock} units</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              p.stock > 0
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {p.stock > 0 ? 'In Stock' : 'Sold Out'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              title="Edit Product"
                              className="p-1.5 rounded-md hover:bg-emerald-900/50 text-stone-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              title="Delete Product"
                              className="p-1.5 rounded-md hover:bg-rose-950/50 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE ORDERS (Matches Screen 15) */}
        {activeTab === 'orders' && (
          <div className="space-y-6 pt-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    orderFilter === status
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : 'bg-[#14221a] text-stone-400 hover:bg-emerald-900/40 hover:text-white border border-emerald-900/40'
                  }`}
                >
                  {status} ({status === 'all' ? orders.length : orders.filter((o) => o.status === status).length})
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-[#14221a] border border-emerald-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-emerald-900/50 bg-[#0f1713]/80 text-stone-400 font-mono uppercase text-[10px]">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status & Update</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-emerald-900/10">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-300">#{o.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{o.customer.fullName}</div>
                          <div className="text-[10px] font-mono text-stone-400">{o.customer.city}, {o.customer.province}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-400">{o.createdAt}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">R{o.total.toFixed(2)}</td>
                        <td className="py-3 px-4 font-mono text-stone-300 uppercase text-[10px]">{o.paymentMethod}</td>
                        <td className="py-3 px-4">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="bg-[#0f1713] text-xs font-mono font-bold text-emerald-300 border border-emerald-800/60 rounded px-2 py-1 focus:outline-none cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`https://wa.me/${o.customer.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              o.customer.fullName
                            )}%2C%20your%20Phethagatsa%20order%20%23${o.id}%20status%20is%20now%20${o.status.toUpperCase()}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-300 text-xs font-mono border border-emerald-700/50 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Notify on WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS & LOYALTY (Matches Screen 16) */}
        {activeTab === 'customers' && (
          <div className="space-y-6 pt-6">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers by name, city, email..."
                className="w-full bg-[#14221a] border border-emerald-900/50 rounded-lg py-2 pl-9 pr-4 text-xs font-sans text-white placeholder-stone-500 focus:outline-none focus:border-emerald-600"
              />
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="rounded-xl bg-[#14221a] border border-emerald-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-emerald-900/50 bg-[#0f1713]/80 text-stone-400 font-mono uppercase text-[10px]">
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Loyalty Points</th>
                      <th className="py-3 px-4">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-emerald-900/10">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{c.name}</div>
                          <div className="text-[10px] font-mono text-stone-400">Member since {c.memberSince}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-300">
                          <div>{c.email}</div>
                          <div className="text-emerald-400">{c.phone || '+27 --'}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-300">{c.city || 'Johannesburg'}, {c.province || 'Gauteng'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-white">{c.totalOrdersCount} orders</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">{c.loyaltyPoints} pts</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/40">
                            {c.memberTier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS & ANALYTICS (Matches Screen 17) */}
        {activeTab === 'reports' && (
          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-[#14221a] border border-emerald-900/40">
                <span className="text-xs font-mono text-stone-400 uppercase">Gross Revenue</span>
                <div className="text-3xl font-extrabold text-emerald-300 font-mono mt-2">
                  R{analytics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-500 font-mono mt-1">+16% month-over-month</p>
              </div>

              <div className="p-5 rounded-xl bg-[#14221a] border border-emerald-900/40">
                <span className="text-xs font-mono text-stone-400 uppercase">Total Orders</span>
                <div className="text-3xl font-extrabold text-white font-mono mt-2">
                  {analytics.totalOrders}
                </div>
                <p className="text-[11px] text-stone-500 font-mono mt-1">100% fulfillment rate</p>
              </div>

              <div className="p-5 rounded-xl bg-[#14221a] border border-emerald-900/40">
                <span className="text-xs font-mono text-stone-400 uppercase">Average Order Value</span>
                <div className="text-3xl font-extrabold text-amber-300 font-mono mt-2">
                  R{analytics.averageOrderValue}
                </div>
                <p className="text-[11px] text-stone-500 font-mono mt-1">Driven by Ritual Bundles</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#14221a] border border-emerald-900/40">
              <h3 className="text-base font-bold text-white font-serif mb-4">Top Performing Botanical Formulations</h3>
              <div className="space-y-3">
                {products.slice(0, 5).map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1713]/80 border border-emerald-900/30">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-emerald-400 w-5">0{idx + 1}</span>
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                      <div>
                        <div className="font-semibold text-white text-xs">{p.name}</div>
                        <div className="text-[10px] font-mono text-stone-400">{p.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-300 text-xs">R{p.price.toFixed(2)}</div>
                      <div className="text-[10px] font-mono text-stone-400">{p.reviewCount} reviews · ★ {p.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS (Matches Screen 18) */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6 pt-6">
            <form onSubmit={handleSaveSettings} className="p-6 rounded-xl bg-[#14221a] border border-emerald-900/40 space-y-5">
              <h3 className="text-base font-bold text-white font-serif border-b border-emerald-900/40 pb-3">
                Storefront & Logistics Configuration
              </h3>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Support Email</label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                    className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Headquarters Address</label>
                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                  className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-emerald-900/30">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Free Courier Threshold (ZAR)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">Standard Delivery Fee (ZAR)</label>
                  <input
                    type="number"
                    value={settings.defaultShipping}
                    onChange={(e) => setSettings({ ...settings, defaultShipping: Number(e.target.value) })}
                    className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save Settings to Live DB
              </button>
            </form>
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT */}
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#14221a] border border-emerald-800/60 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
              <div className="p-5 border-b border-emerald-900/50 flex items-center justify-between bg-[#0f1713]">
                <h3 className="text-base font-bold text-white font-serif">
                  {editingProduct ? 'Edit Skincare Product' : 'Add New Skincare Product'}
                </h3>
                <button
                  onClick={() => setIsAddProductOpen(false)}
                  className="text-stone-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Puso Glow Body Butter"
                    className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Category })}
                      className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                    >
                      <option value="face-care">Face Care</option>
                      <option value="body-care">Body Care</option>
                      <option value="hair-care">Hair Care</option>
                      <option value="bundles">Bundles & Sets</option>
                      <option value="supplements">Supplements & Collagen</option>
                      <option value="superfood">Superfoods</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Price in ZAR (R) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-400 mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="e.g. PG-BB200"
                      className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Tagline / Key Highlight</label>
                  <input
                    type="text"
                    value={productForm.tagline}
                    onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                    placeholder="Short benefit sentence"
                    className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="Leave empty to use default high-res asset"
                    className="w-full bg-[#0f1713] border border-emerald-900/50 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-900/40">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs text-stone-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer shadow-sm"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
