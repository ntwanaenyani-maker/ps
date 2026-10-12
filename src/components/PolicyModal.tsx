import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

export type PolicyKind = 'privacy' | 'returns' | 'terms';

interface PolicyModalProps {
  kind: PolicyKind | null;
  onClose: () => void;
}

interface Section {
  heading: string;
  body: string[];
}

interface PolicyContent {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
}

const CONTACT_EMAIL = 'support@phethagatsa.co.za';
const CONTACT_PHONE = '+27 (0)72 381 9402';

const POLICIES: Record<PolicyKind, PolicyContent> = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'October 2026',
    intro:
      'Phethagatsa Solutions respects your privacy and processes your personal information in line with the Protection of Personal Information Act, 4 of 2013 (POPIA). This notice explains what we collect, why, and the choices you have.',
    sections: [
      {
        heading: 'Information We Collect',
        body: [
          'Account details you provide when registering: name, email address, and a securely hashed password. If you sign in with Google, we receive your name, email address, and profile picture from Google.',
          'Order details: the products you purchase, delivery name, address, phone number, and order history.',
          'Payment information. Card and PayPal payments are processed by our payment providers. We never store your full card number, CVV, or PayPal credentials on our servers.',
          'Basic technical data such as browser type and pages visited, used only to keep the store secure and working.',
        ],
      },
      {
        heading: 'How We Use Your Information',
        body: [
          'To create and secure your account, process and deliver your orders, and provide customer support.',
          'To send transactional messages about your orders. We do not sell your personal information to anyone.',
          'To meet our legal, tax, and accounting obligations.',
        ],
      },
      {
        heading: 'Sharing',
        body: [
          'We share information only with service providers that help us operate the store: our database host, courier partners, and payment processors. These providers may only use it to deliver their service to us.',
          'We may disclose information where the law requires it.',
        ],
      },
      {
        heading: 'Your Rights',
        body: [
          `You may access, correct, or delete your personal information, or withdraw consent, by emailing us at ${CONTACT_EMAIL}.`,
          'You have the right to lodge a complaint with the Information Regulator of South Africa.',
        ],
      },
      {
        heading: 'Security & Retention',
        body: [
          'We protect your data with encryption in transit, hashed passwords, and access controls. We keep personal information only for as long as it is needed for the purposes above or as required by law.',
        ],
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds Policy',
    updated: 'October 2026',
    intro:
      'This policy is provided in line with the Consumer Protection Act, 68 of 2008 and the Electronic Communications and Transactions Act, 25 of 2002. Your statutory rights are always upheld.',
    sections: [
      {
        heading: '7-Day Right to Cancel',
        body: [
          'Because you shop online, you may cancel your order without reason within 7 days of receiving it, provided the goods are unused, in their original packaging, and in a resaleable condition.',
          'To start a cancellation, email us at ' + CONTACT_EMAIL + ' with your order reference. We will arrange collection and refund you within 10 business days of receiving the returned goods.',
        ],
      },
      {
        heading: 'Damaged or Incorrect Goods',
        body: [
          'If your order arrives damaged, defective, or is not what you ordered, contact us within 48 hours with your order reference and a photo. We will arrange a replacement, exchange, or full refund at no cost to you.',
        ],
      },
      {
        heading: 'Hygiene & Opened Cosmetics',
        body: [
          'For health and hygiene reasons, opened skincare, cosmetics, and food products cannot be returned unless they are faulty. Unopened, sealed products may be returned under the 7-day right to cancel above.',
        ],
      },
      {
        heading: 'Refund Method',
        body: [
          'Refunds are issued to the original payment method. PayPal and card refunds are processed through the same provider; EFT and cash-on-delivery refunds are paid by bank transfer to an account in your name.',
        ],
      },
      {
        heading: 'Delivery & Shipping',
        body: [
          'We courier nationwide across South Africa. Orders over R450 qualify for free doorstep delivery. Delivery is typically 2–5 business days after payment is confirmed.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    updated: 'October 2026',
    intro:
      'By using the Phethagatsa Solutions store you agree to these terms. Please read them along with our Privacy Policy and Returns & Refunds Policy.',
    sections: [
      {
        heading: 'Using Our Store',
        body: [
          'You are responsible for keeping your account details confidential and for all activity under your account.',
          'Prices, products, and availability may change without notice. We reserve the right to correct errors and to decline or cancel an order where necessary, with a full refund where payment was taken.',
        ],
      },
      {
        heading: 'Payment',
        body: [
          'We accept bank transfer (EFT), card and PayPal, and cash on delivery where available. An order is confirmed once payment has cleared, except cash on delivery.',
        ],
      },
      {
        heading: 'Product Information',
        body: [
          'Our products are cosmetics and food supplements and are not medicines. They are not intended to diagnose, treat, or cure any condition. Discontinue use and consult a professional if irritation occurs.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'To the extent permitted by law, our liability is limited to the value of the affected order. Nothing in these terms limits rights you have under South African consumer law.',
        ],
      },
      {
        heading: 'Contact',
        body: [`Questions about these terms? Email ${CONTACT_EMAIL} or call ${CONTACT_PHONE}.`],
      },
    ],
  },
};

export const PolicyModal: React.FC<PolicyModalProps> = ({ kind, onClose }) => {
  if (!kind) return null;
  const policy = POLICIES[kind];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={policy.title}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 shadow-2xl rounded-xs my-6 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 sm:px-8 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-stone-100 border border-stone-200 text-stone-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-950 font-serif">{policy.title}</h2>
              <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500">Last updated {policy.updated}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close policy"
            className="p-2 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-6 text-sm text-stone-700 leading-relaxed">
          <p className="text-stone-600">{policy.intro}</p>
          {policy.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900">{section.heading}</h3>
              {section.body.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 bg-stone-50 border-t border-stone-200 px-6 sm:px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
