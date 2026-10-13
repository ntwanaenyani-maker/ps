import React, { useState } from 'react';
import { CartItem, Currency } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { dbService } from '../services/db';
import { getOrderWhatsAppUrl } from '../lib/whatsapp';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, MessageCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  currency: Currency;
  onClose: () => void;
  onUpdateQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string | undefined) => void;
  onOpenCheckout: (discountPercent: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  currency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponFeedback, setCouponFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const FREE_SHIPPING_THRESHOLD = 450; // matches the store's free-courier threshold
  const isFreeShipping = rawSubtotal >= FREE_SHIPPING_THRESHOLD;
  const total = Math.max(0, rawSubtotal - discountAmount);

  const progressPercent = Math.min(100, Math.round((rawSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = dbService.validateCoupon(couponCode);
    if (res.valid) {
      setDiscountPercent(res.discountPercent);
      setCouponFeedback({ message: `Applied: ${res.label} (-${res.discountPercent}%)`, isError: false });
    } else {
      setDiscountPercent(0);
      setCouponFeedback({ message: res.label, isError: true });
    }
  };

  const whatsappBagUrl = getOrderWhatsAppUrl(cart, total);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end"
    >
      <div className="relative w-full max-w-md bg-stone-50 h-full flex flex-col shadow-2xl border-l border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-stone-950 font-serif">
              Phethagatsa Bag
            </h2>
            <p className="text-xs font-mono text-stone-500">
              {cart.reduce((a, b) => a + b.quantity, 0)} {cart.length === 1 ? 'piece' : 'pieces'} reserved
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close bag"
            className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free courier delivery indicator */}
        <div className="bg-stone-100/90 px-5 py-3 border-b border-stone-200 text-xs">
          <div className="flex justify-between items-center text-[11px] font-mono mb-1.5 text-stone-700">
            <span>
              {isFreeShipping ? (
                <strong className="text-emerald-700">✓ Free Express Courier Unlocked (Nationwide)</strong>
              ) : (
                <>Add {formatPrice(FREE_SHIPPING_THRESHOLD - rawSubtotal, currency)} for free courier delivery</>
              )}
            </span>
            <span className="text-stone-500">{progressPercent}%</span>
          </div>
          <div className="w-full bg-stone-300 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-600' : 'bg-stone-950'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length > 0 ? (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedVariant?.id || idx}`}
                className="flex gap-4 p-3 bg-white border border-stone-200 rounded-xs shadow-2xs"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-stone-100 rounded-xs overflow-hidden shrink-0 border border-stone-100">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedVariant?.id)}
                        className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer transition-colors"
                        title="Remove piece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedVariant && (
                      <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                        {item.selectedVariant.name}
                      </p>
                    )}

                    <div className="text-xs font-mono font-medium text-stone-900 mt-1">
                      {formatPrice(item.product.price, currency)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="inline-flex items-center border border-stone-200 rounded-xs bg-stone-50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.selectedVariant?.id, -1)}
                        className="p-1 text-stone-600 hover:text-stone-950 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-mono text-xs text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.selectedVariant?.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 text-stone-600 hover:text-stone-950 disabled:opacity-30 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-stone-500">
                      Total: {formatPrice(item.product.price * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center">
              <p className="text-sm font-semibold text-stone-800">Your bag is currently empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Explore our catalog of authentic fleece hoodies, safari jackets, and caps.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs uppercase font-medium tracking-wider rounded-xs hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Browse Works
              </button>
            </div>
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-white space-y-3.5">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Code: PHETHA10"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xs px-3 py-1.5 text-xs font-mono uppercase text-stone-900 focus:outline-none focus:border-stone-800"
                />
                <Tag className="w-3 h-3 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-mono font-medium rounded-xs transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>

            {couponFeedback && (
              <p className={`text-[11px] font-mono ${couponFeedback.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                {couponFeedback.message}
              </p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-2.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-stone-900">{formatPrice(rawSubtotal, currency)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Collector Discount ({discountPercent}%)</span>
                  <span className="font-mono tabular-nums">-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Courier Guy Delivery</span>
                <span className="font-mono tabular-nums">
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-semibold">Complimentary</span>
                  ) : (
                    <span className="text-stone-400">Calculated at checkout</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                <span>Total</span>
                <span className="font-mono tabular-nums">{formatPrice(total, currency)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout(discountPercent);
                }}
                className="w-full py-3.5 px-6 bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold uppercase tracking-widest rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={whatsappBagUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-center font-medium"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Send Entire Bag to WhatsApp</span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-stone-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant EFT · Card Payment · Cash on Delivery</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
