import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, Database, Menu, X, User, Download } from 'lucide-react';
import { Currency, UserAccount } from '../types/store';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currency: Currency;
  currentUser: UserAccount | null;
  onCurrencyChange: (c: Currency) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenSearch: () => void;
  onOpenDatabaseModal: () => void;
  onOpenOrderLookup: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  currency,
  currentUser,
  onCurrencyChange,
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
  onOpenSearch,
  onOpenDatabaseModal,
  onOpenOrderLookup,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (cat: string) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
    const element = document.getElementById('collection-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      {/* Editorial Announcement Bar */}
      <div className="bg-stone-900 text-stone-300 text-[11px] py-1.5 px-4 text-center tracking-widest uppercase font-mono flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <span>Free Doorstep Courier Across South Africa Over R450</span>
        <span className="hidden sm:inline text-stone-500">·</span>
        <span className="hidden sm:inline text-amber-300">Clean Botanical Cosmetics & Superfoods</span>
        <span className="text-stone-500">·</span>
        <button
          onClick={onOpenOrderLookup}
          className="underline hover:text-white transition-colors cursor-pointer"
        >
          Track An Order
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Uploaded Brand Logo (No Text Typography) */}
        <a
          href="/"
          className="flex items-center py-1.5 hover:opacity-95 transition-opacity"
          aria-label="Phethagatsa Solutions Modern African Skincare"
        >
          <img
            src={BRAND_LOGO_IMAGE}
            alt="Phethagatsa Solutions Modern African Skincare"
            className="h-12 sm:h-14 md:h-16 w-auto max-w-[200px] sm:max-w-[250px] object-contain"
            referrerPolicy="no-referrer"
          />
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs tracking-wider uppercase font-medium text-stone-600">
          <button
            onClick={() => handleNavClick('all')}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            All Products
          </button>
          <button
            onClick={() => handleNavClick('skincare')}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Skincare & Body
          </button>
          <button
            onClick={() => handleNavClick('skincare-kits')}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Pigmentation Transformation Sets
          </button>
          <button
            onClick={() => handleNavClick('supplements')}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Collagen Peptides & Skin Gummies
          </button>
          <button
            onClick={() => handleNavClick('exfoliator')}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Fofa Exfoliating Scrub
          </button>
          <button
            onClick={() => handleNavClick('superfood')}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Organic Chia Seeds
          </button>
          <button
            onClick={() => handleNavClick('health-foods')}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Health Foods
          </button>
          <button
            onClick={() => handleNavClick('accessories')}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Canvas & Leather Totes
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Currency Switcher */}
          <div className="relative inline-flex items-center">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              aria-label="Select Currency"
              className="bg-stone-100 hover:bg-stone-200 text-xs font-mono font-semibold text-stone-800 py-1 pl-2 pr-2 rounded-xs border border-stone-200 focus:outline-none cursor-pointer"
            >
              <option value="ZAR">ZAR (R)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Database Studio Trigger */}
          <button
            onClick={onOpenDatabaseModal}
            title="Inspect Free Persistent Database (Orders, Inventory & JSON)"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono font-medium text-stone-700 bg-stone-200/70 hover:bg-stone-200 hover:text-stone-950 rounded-xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-stone-600" />
            <span>Free DB</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            aria-label="Search Collection"
            className="p-1.5 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Account / Wishlist Trigger */}
          <button
            onClick={onOpenAccount}
            aria-label="Collector Profile & Wishlist Account"
            className="flex items-center gap-1.5 p-1.5 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
            title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign in to access personal wishlist'}
          >
            <User className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-mono font-medium max-w-[90px] truncate">
              {currentUser ? currentUser.name.split(' ')[0] : 'Account'}
            </span>
          </button>

          {/* Wishlist Trigger */}
          <button
            onClick={onOpenWishlist}
            aria-label="View Saved Wishlist"
            className="relative p-1.5 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
            title="Personal Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping Bag"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-stone-950 hover:bg-stone-850 rounded-xs transition-colors cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums font-bold">{cartCount}</span>
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-700 hover:text-stone-950 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-stone-50 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-sm tracking-wider uppercase font-medium text-stone-700">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAccount();
              }}
              className="text-left py-1 text-stone-950 font-bold cursor-pointer flex items-center gap-2 border-b border-stone-200 pb-2"
            >
              <User className="w-4 h-4" />
              <span>{currentUser ? `${currentUser.name} (${currentUser.memberTier})` : 'Sign In to Account'}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWishlist();
              }}
              className="text-left py-1 text-stone-700 hover:text-stone-950 cursor-pointer flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span>Personal Wishlist ({wishlistCount})</span>
            </button>

            <button
              onClick={() => handleNavClick('all')}
              className="text-left py-1 hover:text-stone-950 cursor-pointer"
            >
              All Products
            </button>
            <button
              onClick={() => handleNavClick('skincare')}
              className="text-left py-1 hover:text-stone-950 cursor-pointer"
            >
              Skincare & Body
            </button>
            <button
              onClick={() => handleNavClick('skincare-kits')}
              className="text-left py-1 hover:text-stone-950 cursor-pointer"
            >
              Pigmentation Transformation Sets
            </button>
            <button
              onClick={() => handleNavClick('supplements')}
              className="text-left py-1 hover:text-stone-950 cursor-pointer"
            >
              Collagen Peptides & Skin Gummies
            </button>
            <button
              onClick={() => handleNavClick('exfoliator')}
              className="text-left py-1 hover:text-stone-950 cursor-pointer"
            >
              Fofa Exfoliating Scrub
            </button>
            <button
              onClick={() => handleNavClick('superfood')}
              className="text-left py-1 hover:text-stone-950 cursor-pointer"
            >
              Organic Chia Seeds
            </button>
            <button
              onClick={() => handleNavClick('health-foods')}
              className="text-left py-1 hover:text-stone-950 cursor-pointer"
            >
              Health Foods
            </button>
            <button
              onClick={() => handleNavClick('accessories')}
              className="text-left py-1 hover:text-stone-950 cursor-pointer"
            >
              Canvas & Leather Totes
            </button>

            <div className="pt-2 border-t border-stone-200 flex flex-col space-y-2 text-xs font-mono text-stone-600">
              <button
                onClick={onOpenOrderLookup}
                className="text-left py-1 hover:text-stone-950 cursor-pointer"
              >
                Track Order
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDatabaseModal();
                }}
                className="text-left py-1 hover:text-stone-950 cursor-pointer flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-stone-700" />
                <span>Free Database Engine Inspector</span>
              </button>
              <a
                href="https://wa.me/27723819402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left py-1 text-emerald-800 font-semibold flex items-center gap-1.5"
              >
                <span>WhatsApp Customer Line</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};