import React, { useEffect, useRef, useState } from 'react';
import { Currency } from '../types/store';
import { apiService } from '../services/api';
import { Loader2 } from 'lucide-react';

interface PayPalPaymentProps {
  amount: number;
  currency: Currency;
  orderNumber?: string;
  disabled?: boolean;
  onApproved: (paypalOrderId: string) => void | Promise<void>;
  onError: (message: string) => void;
}

const PAYPAL_CLIENT_ID = (import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined) || '';
// PayPal does not support ZAR; the server settles in this currency.
const PAYPAL_CURRENCY = (import.meta.env.VITE_PAYPAL_CURRENCY as string | undefined) || 'USD';

let sdkPromise: Promise<void> | null = null;
function loadPayPalSdk(currency: string): Promise<void> {
  if ((window as any).paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID
    )}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Could not load PayPal. Please check your connection and try again.'));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  currency,
  orderNumber,
  disabled,
  onApproved,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!PAYPAL_CLIENT_ID) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadPayPalSdk(PAYPAL_CURRENCY)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const paypal = (window as any).paypal;
        if (!paypal?.Buttons) throw new Error('PayPal is unavailable right now.');
        containerRef.current.innerHTML = '';
        paypal
          .Buttons({
            style: { layout: 'vertical', color: 'black', shape: 'rect', label: 'pay', height: 44 },
            onClick: () => {
              if (disabled) {
                onError('Please complete your delivery details before paying.');
                return false;
              }
              return true;
            },
            createOrder: () =>
              apiService
                .createPayPalOrder({ amount, currency, orderNumber })
                .then((d) => d.id),
            onApprove: async (data: any) => {
              try {
                const res = await apiService.capturePayPalOrder({
                  orderId: data.orderID,
                  orderNumber,
                });
                if (res.captured) await onApproved(res.id);
                else onError('Payment was not completed. Please try again.');
              } catch (err: any) {
                onError(err?.message || 'We could not confirm your payment. Please contact us.');
              }
            },
            onError: (err: any) =>
              onError(err?.message || 'PayPal payment failed. Please try again.'),
            onCancel: () => onError('PayPal checkout was cancelled. No payment was taken.'),
          })
          .render(containerRef.current);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoading(false);
          onError(err.message || 'PayPal is unavailable right now.');
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, currency, orderNumber, disabled]);

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 leading-relaxed">
        Card & PayPal payments are not enabled yet. Please choose Offline EFT or Pay On Delivery.
      </div>
    );
  }

  return (
    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs">
      <p className="text-[11px] text-stone-600 mb-3 leading-relaxed">
        Pay securely by card or PayPal balance. Your order is confirmed automatically the moment
        payment clears.
      </p>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading secure PayPal checkout…</span>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
};
