import React, { useState } from 'react';
import { ArrowRight, Check, MessageCircle, Mail, Phone, MapPin, Lock, BookOpen } from 'lucide-react';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';
import { PolicyKind } from './PolicyModal';

interface FooterProps {
  onOpenOrderLookup: () => void;
  onOpenPolicy: (policy: PolicyKind) => void;
  onSelectCategory: (cat: string) => void;
  onOpenAdmin: () => void;
  onOpenProductGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenOrderLookup,
  onOpenPolicy,
  onSelectCategory,
  onOpenAdmin,
  onOpenProductGuide,
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
              Modern African skincare, pediatrician-tested eczema relief balms, targeted
              hyperpigmentation treatments, pure collagen peptides, and organic superfoods crafted
              with botanical integrity.
            </p>
            <ul className="pt-2 text-xs font-mono text-stone-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>Bronkhorstspruit · Witbank · Rustenburg</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <a href="mailto:support@phethagatsa.co.za" className="hover:text-white transition-colors">
                  support@phethagatsa.co.za
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                <a href="tel:+27723819402" className="hover:text-white transition-colors">
                  +27 (0)72 381 9402
                </a>
              </li>
            </ul>
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
                  Skincare & Body
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('skincare-kits')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pigmentation Transformation Sets
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

          {/* Customer Care (1 col) */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-3 font-semibold">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs font-mono text-stone-400">
              <li>
                <button
                  onClick={onOpenProductGuide}
                  className="group flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer text-left"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="underline underline-offset-2">Products Guide</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOrderLookup}
                  className="hover:text-white transition-colors cursor-pointer text-left underline"
                >
                  Track Your Order
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
                  onClick={() => onOpenPolicy('returns')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('faq-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Shipping FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Dispatch (1 col) */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-3 font-semibold">
              Drop Notifications
            </h4>
            <p className="text-[11px] text-stone-400 font-sans mb-3 leading-relaxed">
              Be first to hear about new arrivals, seasonal sets, and limited releases.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                    <span>You're Subscribed</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: legal links & copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span>© {new Date().getFullYear()} Phethagatsa Solutions (Pty) Ltd.</span>
            <span aria-hidden="true">·</span>
            <span>All rights reserved</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center">
            <button onClick={() => onOpenPolicy('privacy')} className="text-stone-400 hover:text-white cursor-pointer">
              Privacy
            </button>
            <button onClick={() => onOpenPolicy('returns')} className="text-stone-400 hover:text-white cursor-pointer">
              Returns
            </button>
            <button onClick={() => onOpenPolicy('terms')} className="text-stone-400 hover:text-white cursor-pointer">
              Terms
            </button>
            <button
              onClick={onOpenAdmin}
              className="text-stone-400 hover:text-white cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
