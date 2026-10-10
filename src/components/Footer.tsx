import React, { useState } from 'react';
import { Database, ArrowRight, Check, MessageCircle, Download } from 'lucide-react';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';

interface FooterProps {
  onOpenDatabase: () => void;
  onOpenOrderLookup: () => void;
  onOpenStarterDownload?: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDatabase,
  onOpenOrderLookup,
  onOpenStarterDownload,
  onSelectCategory,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-stone-800/80">
          {/* Brand & Manifesto (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_LOGO_IMAGE}
                alt="Phethagatsa Solutions Modern African Skincare"
                className="h-14 w-auto object-contain rounded-lg bg-white/95 p-1 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="text-lg font-bold tracking-tight text-white font-serif">
                  Phethagatsa Solutions
                </div>
                <div className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span>🇿🇦 South Africa</span>
                  <span>·</span>
                  <span>Modern African Skincare</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-300 font-sans leading-relaxed max-w-sm">
              Modern African skincare, pediatrician-tested eczema relief balms, targeted hyperpigmentation treatments, pure collagen peptides, and organic superfoods crafted with botanical integrity.
            </p>
            <div className="pt-2 text-xs font-mono text-stone-400 space-y-1">
              <div>PHETHAGATSA SOLUTIONS: Bronkhostspruit -Witbank -Rustenburg</div>
              <div>Contacymts care@phethagats.ck.za - Tel +27 (0)82 956 4472</div>
            </div>
          </div>

          {/* Catalog Categories (1 col) */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-3 font-semibold">
              Wellness Catalog
            </h4>
            <ul className="space-y-2 text-xs font-mono text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('skincare')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Dark Thigh Cream
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('skincare-kits')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pigmentation Corrector Set
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('supplements')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Collagen Peptides & Gummies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('exfoliator')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Fofa Exfoliating Scrub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('superfood')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Organic Chia Seeds
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('accessories')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Canvas & Leather Totes
                </button>
              </li>
            </ul>
          </div>

          {/* Concierge & Orders (1 col) */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-3 font-semibold">
              Concierge
            </h4>
            <ul className="space-y-2 text-xs font-mono text-stone-400">
              <li>
                <button
                  onClick={onOpenOrderLookup}
                  className="hover:text-white transition-colors cursor-pointer text-left underline"
                >
                  Track Consignment
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/27723819402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-500 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Line</span>
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenDatabase}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free Database Hub</span>
                </button>
              </li>
              {onOpenStarterDownload && (
                <li>
                  <button
                    onClick={onOpenStarterDownload}
                    className="hover:text-amber-300 text-amber-400 font-medium transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Web App Starter</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('faq-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Shipping & Returns FAQ
                </button>
              </li>
              <li>
                <span className="text-stone-500">The Courier Guy Tracking</span>
              </li>
              <li>
                <span className="text-stone-500">EFT Proof of Payment</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Dispatch (1 col) */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-3 font-semibold">
              Drop Notifications
            </h4>
            <p className="text-[11px] text-stone-400 font-sans mb-3 leading-relaxed">
              Receive private drop notifications 24 hours prior to limited edition releases.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@gmail.com"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xs px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-stone-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-stone-100 hover:bg-white text-stone-950 text-xs font-mono uppercase font-semibold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inscribed for Drops</span>
                  </>
                ) : (
                  <>
                    <span>Join Collector Roster</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Free Database architecture badge & copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Phethagatsa Store (Pty) Ltd.</span>
            <span aria-hidden="true">·</span>
            <span>All rights reserved</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={onOpenDatabase}
              className="text-stone-400 hover:text-white underline cursor-pointer"
            >
              Free Database Engine Active
            </button>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-stone-500">Maboneng, JHB</span>
            <span className="text-stone-500">Terms of Craft</span>
            <span className="text-stone-500">Zero Cloud Fees</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
