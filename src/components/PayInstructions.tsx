import React, { useState } from 'react';
import { Copy, Check, Landmark, MessageSquare, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { STORE_WHATSAPP_NUMBER, STORE_WHATSAPP_DISPLAY } from '../lib/whatsapp';

const PAYSHAP_CELL_NUMBER = '27829564472';
const PAYSHAP_CELL_DISPLAY = '+27 82 956 4472';

interface PayInstructionsProps {
  orderRef: string;
  totalFormatted: string;
  customerName?: string;
  variant?: 'eft' | 'payshap';
  onPaymentSentViaWhatsApp?: () => void;
}

export const PayInstructions: React.FC<PayInstructionsProps> = ({
  orderRef,
  totalFormatted,
  customerName,
  variant = 'eft',
  onPaymentSentViaWhatsApp,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const isPayshap = variant === 'payshap';

  const bankDetails = [
    { label: 'Bank Name', value: 'Capitec Business' },
    { label: 'Account Holder', value: 'PHETHAGATSA SOLUTIONS (PTY) LTD' },
    { label: 'Account Number', value: '1055581251' },
    { label: 'Account Type', value: 'Capitec Business Account' },
    { label: 'Branch Name', value: 'Relationship Suite' },
    { label: 'Branch Code', value: '450105' },
    { label: 'SWIFT Address', value: 'CABLZAJJ' },
    { label: 'Payment Reference', value: orderRef },
  ];

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const whatsappProofMessage = isPayshap
    ? `*Dumela Phethagatsa Solutions!* 🇿🇦\n\nI have paid via *PayShap* for Order Reference *#${orderRef}* (${customerName || 'Valued Customer'}).\n*Amount Paid:* ${totalFormatted}\n*PayShap Ref:* ${orderRef}\n\n📎 *Attaching PayShap proof of payment below.*\nPlease confirm receipt and courier tracking number. Ke a leboga!`
    : `*Dumela Phethagatsa Solutions!* 🇿🇦\n\nI have transferred payment for Order Reference *#${orderRef}* (${customerName || 'Valued Customer'}).\n*Amount Paid:* ${totalFormatted}\n*Bank Ref:* ${orderRef}\n\n📎 *Attaching Proof of Payment (POP) screenshot / PDF below.*\nPlease confirm receipt and courier tracking number with The Courier Guy!`;

  const whatsappProofUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappProofMessage)}`;

  return (
    <div className="p-4 sm:p-5 bg-stone-50 border border-stone-200 rounded-xs space-y-4 text-xs font-mono">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-200 font-bold text-stone-900 font-sans text-sm">
        <div className="flex items-center gap-2">
          {isPayshap ? (
            <Zap className="w-4 h-4 text-emerald-700" />
          ) : (
            <Landmark className="w-4 h-4 text-emerald-800" />
          )}
          <span>{isPayshap ? 'PayShap — Instant Bank Payment' : 'Offline EFT / Direct Bank Transfer'}</span>
        </div>
        <span
          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border whitespace-nowrap ${
            isPayshap
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          {isPayshap ? 'Recommended · Fastest' : '1–2 business days'}
        </span>
      </div>

      {isPayshap ? (
        <div className="space-y-2">
          <p className="text-stone-600 text-[11px] font-sans leading-relaxed">
            Pay <strong className="text-stone-950 font-mono text-xs">{totalFormatted}</strong> instantly with{' '}
            <strong>PayShap</strong> — money reflects within seconds. Open your banking app, choose{' '}
            <strong>PayShap</strong>, and pay the business cell number below (or use the Capitec account).
            Use <strong className="text-amber-900 font-mono">#{orderRef}</strong> as your reference.
          </p>
          <div className="bg-white border border-stone-200 rounded-xs p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">PayShap Recipient</div>
              <div className="font-semibold text-stone-900">{PAYSHAP_CELL_DISPLAY}</div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('PayShap Cell', PAYSHAP_CELL_NUMBER)}
              className="text-stone-400 hover:text-stone-900 cursor-pointer p-0.5"
              title="Copy PayShap number"
            >
              {copiedKey === 'PayShap Cell' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-stone-600 text-[11px] font-sans leading-relaxed">
          Make an Electronic Funds Transfer (EFT) of{' '}
          <strong className="text-stone-950 font-mono text-xs">{totalFormatted}</strong> from your banking app
          (Capitec, FNB, Standard Bank, Nedbank, Absa, or Tymebank) using your reference{' '}
          <strong className="text-amber-900 font-mono">#{orderRef}</strong>.
        </p>
      )}

      {/* Account Details Box */}
      <div className="bg-white border border-stone-200 rounded-xs divide-y divide-stone-100 text-xs shadow-2xs">
        <div className="px-2.5 pt-2 pb-1 text-[10px] uppercase tracking-wider text-stone-400">
          {isPayshap ? 'Or pay to the business account' : 'Beneficiary account details'}
        </div>
        {bankDetails.map((b) => (
          <div key={b.label} className="p-2.5 flex items-center justify-between gap-2">
            <span className="text-stone-500 text-[11px]">{b.label}</span>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`font-semibold text-right break-words ${
                  b.label === 'Payment Reference' ? 'text-amber-800 font-mono text-sm' : 'text-stone-900'
                }`}
              >
                {b.value}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(b.label, b.value)}
                className="text-stone-400 hover:text-stone-900 cursor-pointer p-0.5 shrink-0"
                title={`Copy ${b.label}`}
              >
                {copiedKey === b.label ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Auto Send WhatsApp Proof Banner */}
      <div className="p-3 bg-emerald-950/5 border border-emerald-700/30 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5 font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Automatic WhatsApp Payment Verification</span>
          </div>
          <p className="text-[11px] text-stone-600 font-sans mt-0.5">
            Send your proof of payment directly to our concierge at{' '}
            <span className="font-mono font-medium text-emerald-900">{STORE_WHATSAPP_DISPLAY}</span>.
          </p>
        </div>

        <a
          href={whatsappProofUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPaymentSentViaWhatsApp}
          className="w-full sm:w-auto px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send POP on WhatsApp</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
