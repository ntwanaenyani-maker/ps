import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from './services/db';
import { Product, CartItem, Currency, Category, Order, UserAccount } from './types/store';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderLookupModal } from './components/OrderLookupModal';
import { DatabaseModal } from './components/DatabaseModal';
import { CustomerAccountPortal } from './components/CustomerAccountPortal';
import { WhatsAppBubble } from './components/WhatsAppBubble';
import { CartBar } from './components/CartBar';
import { StorySection } from './components/StorySection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StarterDownloadModal } from './components/StarterDownloadModal';
import { Download } from 'lucide-react';
import { addRecentView } from './services/recentViews';

export default function App() {
  // App Mode: Customer Storefront vs Admin Portal
  const [appMode, setAppMode] = useState<'storefront' | 'admin'>('storefront');

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState<Currency>('ZAR'); // Default to South African Rand (R)
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Modals & Drawers state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isStarterModalOpen, setIsStarterModalOpen] = useState(false);

  // Sync data with dbService
  const loadState = useCallback(() => {
    setProducts(dbService.getProducts());
    setCart(dbService.getCart());
    setWishlistIds(dbService.getWishlist());
    setCurrentUser(dbService.getCurrentUser());
  }, []);

  useEffect(() => {
    loadState();
    const unsub = dbService.subscribe('*', loadState);
    return () => unsub();
  }, [loadState]);

  // Global escape key handler to close active modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (quickViewProduct) setQuickViewProduct(null);
        else if (isCartOpen) setIsCartOpen(false);
        else if (isWishlistOpen) setIsWishlistOpen(false);
        else if (isAccountOpen) setIsAccountOpen(false);
        else if (isSearchOpen) setIsSearchOpen(false);
        else if (isCheckoutOpen) setIsCheckoutOpen(false);
        else if (completedOrder) setCompletedOrder(null);
        else if (isOrderLookupOpen) setIsOrderLookupOpen(false);
        else if (isDatabaseModalOpen) setIsDatabaseModalOpen(false);
        else if (isStarterModalOpen) setIsStarterModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    quickViewProduct,
    isCartOpen,
    isWishlistOpen,
    isAccountOpen,
    isSearchOpen,
    isCheckoutOpen,
    completedOrder,
    isOrderLookupOpen,
    isDatabaseModalOpen,
    isStarterModalOpen,
  ]);

  const handleAddToCart = (product: Product, quantity = 1, variantId?: string) => {
    dbService.addToCart(product, quantity, variantId);
    setCart(dbService.getCart());
  };

  const handleUpdateCartQuantity = (productId: string, variantId: string | undefined, delta: number) => {
    dbService.updateCartQuantity(productId, variantId, delta);
    setCart(dbService.getCart());
  };

  const handleRemoveFromCart = (productId: string, variantId: string | undefined) => {
    dbService.removeFromCart(productId, variantId);
    setCart(dbService.getCart());
  };

  const handleToggleWishlist = (productId: string) => {
    const res = dbService.toggleWishlist(productId);
    if (res.requiresLogin) {
      setIsAccountOpen(true);
    } else {
      setWishlistIds(dbService.getWishlist());
    }
  };

  const handleLogin = (name: string, email: string, password: string) => {
    const user = dbService.loginUser(name, email, password);
    setCurrentUser(user);
    setWishlistIds(user.wishlistIds);
  };

  const handleLogout = () => {
    dbService.logoutUser();
    setCurrentUser(null);
    setWishlistIds([]);
    setIsAccountOpen(false);
  };

  const handleOpenCheckout = (discountPercent: number) => {
    setCheckoutDiscount(discountPercent);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (order: Order) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(order);
    loadState();
  };

  const handleScrollToGrid = () => {
    const el = document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenProduct = (productOrId: Product | string) => {
    if (typeof productOrId === 'string') {
      const match = products.find((p) => p.id === productOrId);
      if (match) {
        addRecentView(match.id);
        setQuickViewProduct(match);
      }
    } else {
      addRecentView(productOrId.id);
      setQuickViewProduct(productOrId);
    }
  };

  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalZAR = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // If in Admin Dashboard mode, render full-featured Admin App
  if (appMode === 'admin') {
    return (
      <div className="min-h-screen bg-[#0f1713] text-stone-100 flex flex-col">
        {/* Top App Mode Bar */}
        <div className="bg-[#14221a] border-b border-emerald-900/40 px-4 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-bold">Admin Portal Active</span>
            <span className="text-stone-500">·</span>
            <span className="text-stone-400">Manage Products, Orders & Analytics</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStarterModalOpen(true)}
              className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Starter (.ZIP)</span>
            </button>
            <button
              onClick={() => setAppMode('storefront')}
              className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>🛍️ Switch to Customer Storefront</span>
            </button>
          </div>
        </div>

        <AdminDashboard
          onSwitchToStorefront={() => setAppMode('storefront')}
          onOpenProductView={(p) => {
            setAppMode('storefront');
            setQuickViewProduct(p);
          }}
        />

        {/* Starter Download Modal inside Admin */}
        <StarterDownloadModal
          isOpen={isStarterModalOpen}
          onClose={() => setIsStarterModalOpen(false)}
        />
      </div>
    );
  }

  // Otherwise render Customer Storefront App
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white flex flex-col">
      {/* Top Dual-App Quick Switcher Bar */}
      <div className="bg-[#14221a] text-stone-200 text-xs py-1.5 px-4 flex items-center justify-between border-b border-emerald-900/40 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-bold">Phethagatsa Solutions</span>
          <span className="text-stone-500 hidden sm:inline">|</span>
          <span className="text-stone-400 hidden sm:inline">Modern African Skincare</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStarterModalOpen(true)}
            className="px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-2xs"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Download Starter</span>
            <span className="sm:hidden">Starter</span>
          </button>

          <div className="flex items-center bg-black/40 p-0.5 rounded-md border border-emerald-900/60">
            <button
              onClick={() => setAppMode('storefront')}
              className="px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer bg-emerald-700 text-white shadow-xs"
            >
              🛍️ Customer Storefront
            </button>
            <button
              onClick={() => setAppMode('admin')}
              className="px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer text-stone-400 hover:text-white"
            >
              ⚡ Admin Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* 3-Zone Header */}
      <Header
        cartCount={cartTotalItems}
        wishlistCount={wishlistIds.length}
        currency={currency}
        currentUser={currentUser}
        onCurrencyChange={setCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        onOpenAdmin={() => setAppMode('admin')}
        onOpenStarterDownload={() => setIsStarterModalOpen(true)}
        onSelectCategory={(cat) => setSelectedCategory(cat as Category)}
      />

      {/* Main Content Flow */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* Architectural Hero with WhatsApp Link & 4 Provenance Trust Badges */}
        <Hero
          onExploreClick={handleScrollToGrid}
          onOpenQuickView={(id) => {
            const match = products.find((p) => p.id === id);
            if (match) setQuickViewProduct(match);
          }}
        />

        {/* Curated Product Collection Grid with Tactile Zoom */}
        <ProductGrid
          products={products}
          currency={currency}
          wishlistIds={wishlistIds}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onSelectCategory={setSelectedCategory}
          onSearchChange={setSearchQuery}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={(p) => setQuickViewProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
        />

        {/* Provenance & Craftsmanship Narrative: Mother Treating Child's Eczema */}
        <StorySection
          onOpenProduct={(id) => {
            const match = products.find((p) => p.id === id);
            if (match) setQuickViewProduct(match);
          }}
        />

        {/* Common Questions & Customer Care (Shipping, Returns, Care) */}
        <FAQSection />
      </main>

      {/* Footer with Database Info & Concierge */}
      <Footer
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        onOpenStarterDownload={() => setIsStarterModalOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat as Category);
          handleScrollToGrid();
        }}
      />

      {/* Floating Interactive WhatsApp Widget */}
      <WhatsAppBubble
        cart={cart}
        cartTotalZAR={cartTotalZAR}
      />

      {/* Mobile Sticky Quick Cart Bar */}
      <CartBar
        cart={cart}
        currency={currency}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* MODALS & DRAWERS */}
      {/* Quick View PDP Modal with Reviews & WhatsApp Order */}
      <QuickViewModal
        product={quickViewProduct}
        currency={currency}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        currentUser={currentUser}
        onClose={() => setQuickViewProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onRequireLogin={() => setIsAccountOpen(true)}
      />

      {/* Slide-out Cart Drawer with WhatsApp Order */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        currency={currency}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOpenCheckout={handleOpenCheckout}
      />

      {/* Saved Collector Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        wishlistIds={wishlistIds}
        allProducts={products}
        currency={currency}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p, 1)}
      />

      {/* Customer Account Portal ("Welcome back, Mpho!" - Screens 7 to 11) */}
      {isAccountOpen && currentUser && (
        <CustomerAccountPortal
          currentUser={currentUser}
          allProducts={products}
          onClose={() => setIsAccountOpen(false)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onSelectProduct={(p) => setQuickViewProduct(p)}
          onLogout={handleLogout}
        />
      )}

      {/* Quick Keyboard Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        currency={currency}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Single-Page Checkout Modal with South African EFT Pay Instructions */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        currency={currency}
        discountPercent={checkoutDiscount}
        currentUser={currentUser}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Order Confirmation Receipt Modal with Banking POP */}
      <OrderConfirmationModal
        order={completedOrder}
        currency={currency}
        onClose={() => setCompletedOrder(null)}
        onOpenDatabase={() => {
          setCompletedOrder(null);
          setIsDatabaseModalOpen(true);
        }}
      />

      {/* Order Tracking Lookup Modal */}
      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        currency={currency}
        onClose={() => setIsOrderLookupOpen(false)}
      />

      {/* Free Database Studio Inspector */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />

      {/* Starter Monorepo Download Modal */}
      <StarterDownloadModal
        isOpen={isStarterModalOpen}
        onClose={() => setIsStarterModalOpen(false)}
      />
    </div>
  );
}
