import React, { useState } from 'react';
import { CartItem, Currency, OrderCustomer, Order, UserAccount } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { dbService } from '../services/db';
import { apiService } from '../services/api';
import { PayInstructions } from './PayInstructions';
import { getOrderWhatsAppUrl, getOfflineEftWhatsAppUrl } from '../lib/whatsapp';
import { generateOrderRef } from '../lib/orderRef';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';
import { PayPalPayment } from './PayPalPayment';
import { StitchPayment } from './StitchPayment';
import { PaymentMethodsResponse } from '../services/api';
import { X, Lock, ShieldCheck, CreditCard, Landmark, Banknote, CheckCircle2, MessageCircle, Loader2, Zap } from 'lucide-react';

type CheckoutMethod = 'paypal' | 'payshap' | 'stitch' | 'instant-eft' | 'payfast' | 'cod' | 'wire';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  currency: Currency;
  discountPercent: number;
  currentUser: UserAccount | null;
  paymentMethods: PaymentMethodsResponse | null;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  currency,
  discountPercent,
  currentUser,
  paymentMethods,
  onClose,
  onOrderCompleted,
}) => {
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

  const [paymentMethod, setPaymentMethod] = useState<CheckoutMethod>('payshap');
  const [autoSendWhatsAppEft, setAutoSendWhatsAppEft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paypalOrder, setPaypalOrder] = useState<Order | null>(null);
  const [stitchOrder, setStitchOrder] = useState<Order | null>(null);

  const provisionalRef = React.useMemo(() => generateOrderRef(), []);

  // Which methods are switched on in the admin panel. When the list hasn't
  // loaded yet we fall back to the historical defaults (all shown) so checkout
  // never breaks.
  const showPaypal = !paymentMethods || (paymentMethods.paypal.enabled && paymentMethods.paypal.configured);
  const showPayshap = !paymentMethods || paymentMethods.payshap.enabled;
  const showStitch = !paymentMethods || (paymentMethods.stitch.enabled && paymentMethods.stitch.configured);
  const showEft = !paymentMethods || paymentMethods.eft.enabled;
  const showCod = !paymentMethods || paymentMethods.cod.enabled;

  const isShown = (m: CheckoutMethod): boolean => {
    if (m === 'paypal') return showPaypal;
    if (m === 'payshap') return showPayshap;
    if (m === 'stitch') return showStitch;
    if (m === 'wire' || m === 'instant-eft' || m === 'payfast') return showEft;
    if (m === 'cod') return showCod;
    return false;
  };

  // PayShap is the recommended, fastest option, so it is selected by default
  // when available — followed by EFT, then Card & PayPal.
  const firstAvailable = React.useMemo<CheckoutMethod>(() => {
    if (showPayshap) return 'payshap';
    if (showEft) return 'wire';
    if (showPaypal) return 'paypal';
    if (showStitch) return 'stitch';
    if (showCod) return 'cod';
    return 'wire';
  }, [showPayshap, showEft, showPaypal, showStitch, showCod]);

  React.useEffect(() => {
    if (!isOpen) return;
    setPaymentMethod((prev) => (isShown(prev) ? prev : firstAvailable));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, firstAvailable]);

  if (!isOpen || cart.length === 0) return null;

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

      setIsSubmitting(false);

      // Card / PayPal: create the order first, then hand off to PayPal. The
      // server marks the order paid once the payment is captured.
      if (paymentMethod === 'paypal') {
        setPaypalOrder(order);
        return;
      }

      // Pay by Bank (Stitch): create the order, then hand off to the Stitch
      // redirect. The server marks the order paid once payment is confirmed.
      if (paymentMethod === 'stitch') {
        setStitchOrder(order);
        return;
      }

      // Auto-send WhatsApp if an offline bank method (PayShap / EFT) is chosen.
      if ((paymentMethod === 'wire' || paymentMethod === 'instant-eft' || paymentMethod === 'payshap') && autoSendWhatsAppEft) {
        const whatsappUrl = getOfflineEftWhatsAppUrl(
          order.id,
          customer.fullName,
          total,
          cart,
          customer.phone,
          paymentMethod === 'payshap' ? 'PayShap' : 'Offline EFT Payment'
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

  const handlePayPalApproved = () => {
    if (paypalOrder) onOrderCompleted(paypalOrder);
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
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {showPayshap && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('payshap')}
                      className={`relative p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'payshap'
                          ? 'border-emerald-800 bg-emerald-950 text-white shadow-xs'
                          : 'border-emerald-300 bg-emerald-50/60 text-stone-700 hover:bg-emerald-50'
                      }`}
                    >
                      <span className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                        Recommended
                      </span>
                      <Zap className="w-4 h-4 mb-1.5 text-emerald-500" />
                      <span className="text-xs font-semibold">PayShap</span>
                      <span className="text-[10px] font-mono opacity-90 text-emerald-700">
                        Instant · Fastest
                      </span>
                    </button>
                  )}

                  {showEft && (
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
                  )}

                  {showPaypal && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'paypal'
                          ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1.5" />
                      <span className="text-xs font-semibold">Card & PayPal</span>
                      <span className="text-[10px] font-mono opacity-80">Secure online payment</span>
                    </button>
                  )}

                  {showStitch && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stitch')}
                      className={`p-3 text-left border rounded-xs transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'stitch'
                          ? 'border-emerald-800 bg-emerald-950 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Landmark className="w-4 h-4 mb-1.5 text-emerald-400" />
                      <span className="text-xs font-semibold">Pay by Bank</span>
                      <span className="text-[10px] font-mono opacity-90 text-emerald-200">Capitec · Absa · PayShap</span>
                    </button>
                  )}

                  {showCod && (
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
                  )}
                </div>

                {!showPayshap && !showEft && !showPaypal && !showStitch && !showCod && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-800">
                    No online payment methods are available right now. Please send your order on
                    WhatsApp and we'll arrange payment with you directly.
                  </div>
                )}

                {/* Conditional Form Fields */}
                {paymentMethod === 'payshap' && (
                  <div className="space-y-3">
                    <PayInstructions
                      variant="payshap"
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
                        Automatically open WhatsApp with your PayShap proof of payment after placing the order
                      </span>
                    </label>
                  </div>
                )}

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

                {paymentMethod === 'paypal' && (
                  paypalOrder ? (
                    <PayPalPayment
                      amount={total}
                      currency={currency}
                      orderNumber={paypalOrder.id}
                      onApproved={handlePayPalApproved}
                      onError={setSubmitError}
                    />
                  ) : (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs text-xs space-y-1.5">
                      <p className="font-semibold text-stone-900">Card & PayPal</p>
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        Continue to secure PayPal checkout to pay by card or with your PayPal
                        balance. Your order is confirmed automatically once payment clears.
                      </p>
                    </div>
                  )
                )}

                {paymentMethod === 'stitch' && (
                  stitchOrder ? (
                    <StitchPayment
                      amount={total}
                      currency={currency}
                      orderNumber={stitchOrder.id}
                      payerName={customer.fullName}
                      payerEmail={customer.email}
                      payerPhone={customer.phone}
                      onError={setSubmitError}
                    />
                  ) : (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs text-xs space-y-1.5">
                      <p className="font-semibold text-stone-900">Pay by Bank (Stitch)</p>
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        Continue to pay directly from your South African bank account. You'll approve
                        the payment in your bank, then return here automatically.
                      </p>
                    </div>
                  )
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
                {(showPayshap || showEft || showPaypal || showStitch || showCod) &&
                  !((paymentMethod === 'paypal' && paypalOrder) || (paymentMethod === 'stitch' && stitchOrder)) && (
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
                        <span>
                          {paymentMethod === 'paypal'
                            ? `Continue to PayPal · ${formatPrice(total, currency)}`
                            : paymentMethod === 'stitch'
                              ? `Continue to Pay by Bank · ${formatPrice(total, currency)}`
                              : paymentMethod === 'payshap'
                                ? `Place PayShap Order · ${formatPrice(total, currency)}`
                                : `Authorize Order · ${formatPrice(total, currency)}`}
                        </span>
                      </>
                    )}
                  </button>
                )}

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
                  <span>Secure checkout · Your data is encrypted in transit</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
