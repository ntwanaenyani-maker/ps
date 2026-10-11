import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from './services/db';
import { apiService } from './services/api';
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
import { StarterDownloadModal } from './components/StarterDownloadModal';
import { AccountModal } from './components/AccountModal';
import { Download } from 'lucide-react';
import { addRecentView } from './services/recentViews';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState<Currency>('ZAR'); // Default to South African Rand (R)
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [serverOrders, setServerOrders] = useState<Order[]>([]);

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

  // Sync data with dbService and restore server session + catalog
  const loadState = useCallback(() => {
    setProducts(dbService.getProducts());
    setCart(dbService.getCart());
    const user = dbService.getCurrentUser();
    setCurrentUser(user);
    if (user) setWishlistIds(user.wishlistIds);
  }, []);

  useEffect(() => {
    loadState();

    // Load catalog from the server (falls back to local seed data on failure)
    apiService
      .getProducts()
      .then((serverProducts) => {
        if (serverProducts.length > 0) {
          dbService.seedServerProducts(serverProducts);
          setProducts(dbService.getProducts());
        }
      })
      .catch(() => {
        // Offline or API unavailable — keep local seed catalog
      });

    // Restore signed-in session. Commercial mode: everyone starts signed out.
    // If the server session is gone but a stale local mirror exists (e.g. from
    // the old demo account), drop it so the visitor sees the signed-out state.
    apiService
      .me()
      .then((user) => {
        if (user) {
          dbService.setCurrentUser(user);
          setCurrentUser(user);
          setWishlistIds(user.wishlistIds);
        } else if (dbService.getCurrentUser()) {
          dbService.logoutUser();
          setCurrentUser(null);
          setWishlistIds([]);
        }
      })
      .catch(() => undefined);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // Persist wishlist for signed-in users
      if (currentUser) {
        const merged = dbService.getWishlist();
        dbService.updateCurrentUser({ wishlistIds: merged });
        setCurrentUser(dbService.getCurrentUser());
      }
    }
  };

  const handleLogin = (user: UserAccount) => {
    dbService.setCurrentUser(user);
    setCurrentUser(user);
    setWishlistIds(user.wishlistIds);
    setIsAccountOpen(false);
    // Refresh their order history from the server
    apiService
      .getMyOrders()
      .then((orders) => setServerOrders(orders))
      .catch(() => undefined);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch {
      // ignore network errors on logout
    }
    dbService.logoutUser();
    setCurrentUser(null);
    setWishlistIds([]);
    setServerOrders([]);
    setIsAccountOpen(false);
  };

  const handleOpenCheckout = (discountPercent: number) => {
    setCheckoutDiscount(discountPercent);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (order: Order) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(order);
    dbService.addServerOrder(order);
    // Optimistically refresh loyalty/order counters
    setCurrentUser(dbService.getCurrentUser());
    setServerOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    if (currentUser) {
      apiService
        .getMyOrders()
        .then((orders) => setServerOrders(orders))
        .catch(() => undefined);
    }
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

  // Main Storefront App
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white flex flex-col">
      {/* Top Dual-App Quick Switcher Bar (Simplified for Storefront Only) */}
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
          orders={serverOrders}
          onClose={() => setIsAccountOpen(false)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onSelectProduct={(p) => setQuickViewProduct(p)}
          onLogout={handleLogout}
        />
      )}

      {/* Sign In / Create Account Modal (server-backed auth) */}
      <AccountModal
        isOpen={isAccountOpen && !currentUser}
        currentUser={currentUser}
        allProducts={products}
        currency={currency}
        orders={serverOrders}
        onClose={() => setIsAccountOpen(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onViewOrder={(o) => setCompletedOrder(o)}
        onRequireAccount={() => setIsAccountOpen(true)}
      />

      {/* Starter Download Modal */}
      <StarterDownloadModal
        isOpen={isStarterModalOpen}
        onClose={() => setIsStarterModalOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        currency={currency}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => {
          setQuickViewProduct(p);
          setIsSearchOpen(false);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        currency={currency}
        discountPercent={checkoutDiscount}
        currentUser={currentUser}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Order Confirmation Modal */}
      {completedOrder && (
        <OrderConfirmationModal
          order={completedOrder}
          currency={currency}
          onClose={() => setCompletedOrder(null)}
          onOpenDatabase={() => setIsDatabaseModalOpen(true)}
        />
      )}

      {/* Order Lookup Modal (server-backed tracking) */}
      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        currency={currency}
        onClose={() => setIsOrderLookupOpen(false)}
      />

      {/* Database Modal */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />
    </div>
  );
};
