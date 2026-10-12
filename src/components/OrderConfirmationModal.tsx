import React, { useState } from 'react';
import { Order, Currency } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { PayInstructions } from './PayInstructions';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';
import { STORE_WHATSAPP_NUMBER, STORE_WHATSAPP_DISPLAY, getOfflineEftWhatsAppUrl } from '../lib/whatsapp';
import { CheckCircle, Copy, Check, Clock, MapPin, MessageCircle } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  currency: Currency;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  currency,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusSteps: { key: Order['status']; label: string }[] = [
    { key: 'confirmed', label: 'Order Registered' },
    { key: 'crafting', label: 'Quality Verification' },
    { key: 'dispatched', label: 'Courier In Transit' },
    { key: 'delivered', label: 'Handover Completed' },
  ];

  const isPayshap = order.paymentMethod === 'payshap';
  const isEft = order.paymentMethod === 'wire' || order.paymentMethod === 'instant-eft';
  const isOfflineBank = isEft || isPayshap;

  const whatsappShareUrl = isOfflineBank
    ? getOfflineEftWhatsAppUrl(
        order.id,
        order.customer.fullName,
        order.total,
        order.items,
        order.customer.phone,
        isPayshap ? 'PayShap' : 'Offline EFT Payment'
      )
    : `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Dumela Phethagatsa Store! I placed Order Reference #${order.id} for total ${formatPrice(order.total, currency)}. Recipient: ${order.customer.fullName}.`
      )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 shadow-2xl rounded-xs overflow-hidden my-6 p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
        {/* Success Icon & Header */}
        <div className="text-center pb-6 border-b border-stone-200">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src={BRAND_LOGO_IMAGE}
              alt="Phethagatsa Solutions Logo"
              className="h-12 w-auto object-contain rounded-md bg-white p-0.5 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-800 font-semibold mb-1">
            Order Received
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-serif">
            Order #{order.id} Confirmed
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Siyabonga / Ke a leboga, {order.customer.fullName}. We have received your order and our Johannesburg atelier is preparing courier dispatch.
          </p>

          {/* Copy Order ID Chip */}
          <div className="mt-4 inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xs border border-stone-200 text-xs font-mono text-stone-800">
            <span>Reference: <strong>{order.id}</strong></span>
            <button
              onClick={handleCopy}
              className="text-stone-500 hover:text-stone-900 cursor-pointer p-0.5 ml-1"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Live Timeline Step Indicator */}
        <div className="py-6 border-b border-stone-200">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-4 text-center">
            Estimated Courier Handover: {order.estimatedDelivery}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
            {statusSteps.map((step, idx) => {
              const isPastOrCurrent = idx === 0;
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[11px] font-bold ${
                      isPastOrCurrent
                        ? 'bg-stone-950 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] ${isPastOrCurrent ? 'font-semibold text-stone-900' : 'text-stone-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* If PayShap / EFT Payment Method: Render Banking Details */}
        {isOfflineBank && (
          <div className="py-5 border-b border-stone-200">
            <PayInstructions
              variant={isPayshap ? 'payshap' : 'eft'}
              orderRef={order.id}
              totalFormatted={formatPrice(order.total, currency)}
              customerName={order.customer.fullName}
            />
          </div>
        )}

        {/* Order Details & Summary */}
        <div className="py-6 space-y-4 text-xs text-stone-700 border-b border-stone-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xs">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-1">
                <MapPin className="w-3.5 h-3.5 text-stone-600" />
                <span>Delivery Address</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                {order.customer.fullName}<br />
                {order.customer.address}<br />
                {order.customer.city}, {order.customer.postalCode}, {order.customer.country}<br />
                {order.customer.phone}
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xs">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-1">
                <Clock className="w-3.5 h-3.5 text-stone-600" />
                <span>Financial Settlement</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Payment Type: <span className="uppercase font-mono font-medium text-stone-900">{order.paymentMethod === 'wire' || order.paymentMethod === 'instant-eft' ? 'EFT Bank Transfer' : order.paymentMethod === 'payshap' ? 'PayShap (Instant)' : order.paymentMethod === 'paypal' ? 'Card / PayPal' : order.paymentMethod === 'stitch' ? 'Pay by Bank (Stitch)' : order.paymentMethod.toUpperCase()}</span><br />
                Amount: <span className="font-mono font-semibold text-stone-950">{formatPrice(order.total, currency)}</span><br />
                Courier Insurance: Covered<br />
                Date: {order.createdAt}
              </p>
            </div>
          </div>

          {/* Itemized Manifest */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-2">
              Itemized Manifest
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-stone-50 border border-stone-150 rounded-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-9 h-9 object-cover rounded-xs" />
                    <div>
                      <div className="font-medium text-stone-900">{item.product.name}</div>
                      <div className="text-[10px] font-mono text-stone-500">
                        Qty {item.quantity} · {item.selectedVariant?.name || 'Standard'}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-stone-900 font-medium">
                    {formatPrice(item.product.price * item.quantity, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-medium rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{isEft ? 'Send POP & Notify on WhatsApp' : 'Notify Atelier on WhatsApp'}</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
