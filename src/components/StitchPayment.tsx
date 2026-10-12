import React, { useEffect, useState } from 'react';
import { Currency } from '../types/store';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { Loader2, Landmark, ShieldCheck } from 'lucide-react';

interface StitchPaymentProps {
  amount: number;
  currency: Currency;
  orderNumber?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  disabled?: boolean;
  onError: (message: string) => void;
}

export const StitchPayment: React.FC<StitchPaymentProps> = ({
  amount,
  currency,
  orderNumber,
  payerName,
  payerEmail,
  payerPhone,
  disabled,
  onError,
}) => {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiService
      .stitchStatus()
      .then((res) => {
        if (!cancelled) setConfigured(Boolean(res.stitchConfigured));
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePay = async () => {
    if (disabled) {
      onError('Please complete your delivery details before paying.');
      return;
    }
    setRedirecting(true);
    try {
      const res = await apiService.createStitchPayment({
        amount,
        currency,
        orderNumber,
        payerName,
        payerEmail,
        payerPhone,
      });
      window.location.assign(res.redirectUrl || res.url);
    } catch (err: any) {
      setRedirecting(false);
      onError(err?.message || 'We could not start Pay by Bank. Please try again.');
    }
  };

  if (configured === false) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 leading-relaxed">
        Pay by Bank is not enabled yet. Please choose Offline EFT or Pay On Delivery.
      </div>
    );
  }

  return (
    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs">
      <p className="text-[11px] text-stone-600 mb-3 leading-relaxed">
        Pay instantly from your South African bank account via Stitch (Capitec Pay, Absa Pay,
        PayShap and more). You'll be redirected to your bank to approve the payment, then brought
        back here. Your order is confirmed the moment payment clears.
      </p>
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || redirecting || configured === null}
        className="w-full py-3 px-6 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-widest rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
      >
        {redirecting || configured === null ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{redirecting ? 'Redirecting to your bank…' : 'Loading…'}</span>
          </>
        ) : (
          <>
            <Landmark className="w-4 h-4" />
            <span>Pay {formatPrice(amount, currency)} with your bank</span>
          </>
        )}
      </button>
      <div className="mt-3 text-[10px] font-mono text-stone-500 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
        <span>Secured by Stitch · POPIA compliant</span>
      </div>
    </div>
  );
};
