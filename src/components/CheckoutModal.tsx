import React, { useState } from 'react';
import { CartItem, Currency, OrderCustomer, Order, UserAccount } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { dbService } from '../services/db';
import { apiService } from '../services/api';
import { PayInstructions } from './PayInstructions';
import { getOrderWhatsAppUrl, getOfflineEftWhatsAppUrl, STORE_WHATSAPP_DISPLAY } from '../lib/whatsapp';
import { generateOrderRef } from '../lib/orderRef';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';
import { X, Lock, ShieldCheck, CreditCard, Landmark, Banknote, CheckCircle2, MessageCircle, Send, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  currency: Currency;
  discountPercent: number;
  currentUser: UserAccount | null;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  currency,
  discountPercent,
  currentUser,
  onClose,
  onOrderCompleted,
}) => {
  if (!isOpen || cart.length === 0) return null;

  const [customer, setCustomer] = useState<OrderCustomer>({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    province: currentUser?.province || 'Gauteng',
    postalCode: currentUser?.postalCode || '',
    country: 'South Africa',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'instant-eft' | 'payfast' | 'cod' | 'wire'>('wire'); // Offline EFT default
  const [autoSendWhatsAppEft, setAutoSendWhatsAppEft] = useState(true);
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('892');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const provisionalRef = React.useMemo(() => generateOrderRef(), []);

  const rawSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const FREE_SHIPPING_THRESHOLD = 1200;
  const isFreeShipping = rawSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingAmount = isFreeShipping ? 0 : 120; // R120 national courier
  const vat = Math.round((rawSubtotal - discountAmount) * 0.15); // 15% South African VAT included
  const total = Math.max(0, rawSubtotal - discountAmount + shippingAmount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const order = await apiService.createOrder({
        customer,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          variantId: item.selectedVariant?.id,
          variantName: item.selectedVariant?.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal: rawSubtotal,
        discount: discountAmount,
        shipping: shippingAmount,
        total,
        currency,
        paymentMethod,
      });

      // Record locally too so confirmation/tracking works offline
      dbService.addServerOrder(order);

      // Card payments: hand off to Paystack when a secret key is configured.
      if (paymentMethod === 'card') {
        try {
          const pay = await apiService.initializePayment({
            email: customer.email,
            amount: total,
            orderNumber: order.id,
          });
          if (pay.paystackConfigured && pay.authorizationUrl) {
            window.location.href = pay.authorizationUrl;
            return; // redirecting to hosted checkout
          }
          // Paystack not configured yet — show its guidance and keep the order pending.
          setSubmitError(pay.message || 'Card payments are coming soon. Use Offline EFT or Pay On Delivery.');
          setIsSubmitting(false);
          onOrderCompleted(order);
          return;
        } catch (payErr: any) {
          setSubmitError(payErr.message || 'Card payment could not start. Use Offline EFT instead.');
          setIsSubmitting(false);
          onOrderCompleted(order);
          return;
        }
      }

      setIsSubmitting(false);

      // Auto-send WhatsApp if Offline EFT is chosen and auto-send is checked
      if ((paymentMethod === 'wire' || paymentMethod === 'instant-eft') && autoSendWhatsAppEft) {
        const whatsappUrl = getOfflineEftWhatsAppUrl(
          order.id,
          customer.fullName,
          total,
          cart,
          customer.phone
        );
        try {
          window.open(whatsappUrl, '_blank');
        } catch {
          console.warn('Popup blocked, WhatsApp link available on confirmation');
        }
      }

      onOrderCompleted(order);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Could not place the order. Please try again.');
    }
  };

  const whatsappCheckoutUrl = getOrderWhatsAppUrl(cart, total, provisionalRef, customer.fullName);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-4xl bg-white border border-stone-200 shadow-2xl rounded-xs overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-stone-100">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_LOGO_IMAGE}
              alt="Phethagatsa Solutions Logo"
              className="h-10 w-auto object-contain rounded-md bg-white p-0.5 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-gold-accent" />
                <h2 className="text-sm font-bold tracking-wider text-white font-serif uppercase">
                  Phethagatsa Solutions · Secure Checkout
                </h2>
              </div>
              <p className="text-[10px] font-mono text-stone-300">South Africa Doorstep Courier & Instant EFT Settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cancel checkout"
            className="p-1.5 text-stone-400 hover:text-white rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-stone-200">
            {/* Left Column: Customer & Delivery details (7 cols) */}
            <div className="md:col-span-7 p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
              {/* Section 1: Customer Info */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-mono">1</span>
                  <span>Recipient & Delivery Address</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Phone Number (Mobile for Courier)</label>
                      <input
                        type="tel"
                        required
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 mb-1">Street Address / Suburb</label>
                    <input
                      type="text"
                      required
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={customer.postalCode}
                        onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Country</label>
                      <input
                        type="text"
                        required
                        value={customer.country}
                        onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="pt-4 border-t border-stone-200">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-mono">2</span>
                  <span>Payment Settlement Method</span>
                </h3>

                {/* Method Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'wire'
                        ? 'border-emerald-800 bg-emerald-950 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Landmark className="w-4 h-4 mb-1.5 text-emerald-400" />
                    <span className="text-xs font-semibold">Offline EFT Payment</span>
                    <span className="text-[10px] font-mono opacity-90 text-emerald-200">Auto WhatsApp POP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'card'
                        ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1.5" />
                    <span className="text-xs font-semibold">Debit / Credit Card</span>
                    <span className="text-[10px] font-mono opacity-80">Visa & Mastercard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mb-1.5" />
                    <span className="text-xs font-semibold">Pay On Delivery</span>
                    <span className="text-[10px] font-mono opacity-80">Cash or POS</span>
                  </button>
                </div>

                {/* Conditional Form Fields */}
                {paymentMethod === 'wire' && (
                  <div className="space-y-3">
                    <PayInstructions
                      orderRef={provisionalRef}
                      totalFormatted={formatPrice(total, currency)}
                      customerName={customer.fullName}
                    />
                    <label className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoSendWhatsAppEft}
                        onChange={(e) => setAutoSendWhatsAppEft(e.target.checked)}
                        className="rounded border-emerald-300 text-emerald-700 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-emerald-900 font-medium text-[11px]">
                        Automatically open WhatsApp (+27 82 956 4472) with order breakdown when payment is made
                      </span>
                    </label>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• 4242"
                        className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-stone-600 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-stone-600 mb-1">CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVV"
                          className="w-full bg-white border border-stone-300 rounded-xs px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-stone-100/70 border border-stone-200 rounded-xs text-xs space-y-1.5 font-sans">
                    <p className="font-semibold text-stone-900">Payment on Delivery Verification</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Our dispatch driver will call your mobile ({customer.phone}) prior to delivery. Pay via portable card speedpoint or exact cash upon physical handover.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Manifest & Dual Placement (5 cols) */}
            <div className="md:col-span-5 p-6 sm:p-8 bg-stone-50 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold mb-4">
                  Consignment Summary ({cart.length} works)
                </h3>

                {/* Items Manifest List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs bg-white p-2.5 border border-stone-200 rounded-xs">
                      <img src={item.product.image} alt={item.product.name} className="w-11 h-11 object-cover rounded-xs" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-stone-900 truncate">{item.product.name}</div>
                        <div className="text-[10px] font-mono text-stone-500">
                          Qty {item.quantity} · {item.selectedVariant?.name || 'Standard'}
                        </div>
                      </div>
                      <div className="font-mono text-stone-950 font-bold">
                        {formatPrice(item.product.price * item.quantity, currency)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="mt-6 pt-4 border-t border-stone-200 space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums text-stone-900">{formatPrice(rawSubtotal, currency)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Privilege Code (-{discountPercent}%)</span>
                      <span className="font-mono tabular-nums">-{formatPrice(discountAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Door-to-Door Courier</span>
                    <span className="font-mono tabular-nums">
                      {isFreeShipping ? <span className="text-emerald-700 font-semibold">Complimentary</span> : formatPrice(shippingAmount, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>15% SA VAT Included</span>
                    <span className="font-mono tabular-nums text-stone-900">{formatPrice(vat, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-stone-950 pt-3 border-t border-stone-200">
                    <span>Total Settlement</span>
                    <span className="font-mono tabular-nums">{formatPrice(total, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Authorize & Place Order Buttons */}
              <div className="mt-8 space-y-2.5">
                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs">{submitError}</div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold uppercase tracking-widest rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Placing Your Order…</span>
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Authorize Order · {formatPrice(total, currency)}</span>
                    </>
                  )}
                </button>

                {/* Direct WhatsApp Order Alternative */}
                <a
                  href={whatsappCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-center font-medium"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Send Order On WhatsApp Instead</span>
                </a>

                <div className="text-center text-[10px] font-mono text-stone-400 flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                  <span>Permanent Record Saved to Database Engine</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
