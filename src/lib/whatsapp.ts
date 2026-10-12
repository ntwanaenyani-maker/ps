import { Product, CartItem, ProductVariant } from '../types/store';
import { formatMoney } from './money';

export const STORE_WHATSAPP_NUMBER = '27829564472'; // +27 82 956 4472
export const STORE_WHATSAPP_DISPLAY = '+27 82 956 4472';

/**
 * Generate a pre-filled WhatsApp link to order an individual product or ask sizing/routine advice.
 */
export function getProductWhatsAppUrl(product: Product, variant?: ProductVariant): string {
  const variantText = variant ? ` (Variant: ${variant.name})` : '';
  const message = `Dumela / Hello Phethagatsa Solutions! 👋\n\nI am interested in ordering:\n*${product.name}*${variantText}\nPrice: ${formatMoney(product.price, 'ZAR')}\n\nCould you please confirm availability and doorstep courier delivery?`;

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a pre-filled WhatsApp link to send an entire shopping bag or placed order.
 */
export function getOrderWhatsAppUrl(
  items: CartItem[],
  totalZAR: number,
  orderRef?: string,
  customerName?: string
): string {
  const greeting = customerName ? `Dumela! My name is ${customerName}.` : 'Dumela / Hello Phethagatsa Store!';
  const refText = orderRef ? `\n*Order Reference: #${orderRef}*` : '';

  const itemList = items
    .map((item, index) => {
      const vText = item.selectedVariant ? ` (${item.selectedVariant.name})` : '';
      return `${index + 1}. *${item.product.name}*${vText} × ${item.quantity} - ${formatMoney(item.product.price * item.quantity, 'ZAR')}`;
    })
    .join('\n');

  const message = `${greeting}\nI would like to complete my order from the store:${refText}\n\n*Manifest:*\n${itemList}\n\n*Total Amount:* ${formatMoney(totalZAR, 'ZAR')}\n\nPlease share banking details or confirm payment on delivery. Ke a leboga!`;

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate automatic WhatsApp message when Offline EFT Payment is made, with Proof of Payment instructions.
 */
export function getOfflineEftWhatsAppUrl(
  orderRef: string,
  customerName: string,
  totalZAR: number,
  items: CartItem[],
  customerPhone?: string,
  methodName = 'Offline EFT Payment'
): string {
  const itemList = items
    .map((item, index) => `• ${item.product.name} (x${item.quantity}) - ${formatMoney(item.product.price * item.quantity, 'ZAR')}`)
    .join('\n');

  const message = `*Dumela Phethagatsa Solutions!* 🇿🇦\n\nI have completed a *${methodName}* for my order!\n\n*Order Ref:* #${orderRef}\n*Customer:* ${customerName}\n*Phone:* ${customerPhone || 'Provided on checkout'}\n*Total Amount Paid:* ${formatMoney(totalZAR, 'ZAR')}\n\n*Order Items:*\n${itemList}\n\n📎 *Attaching Proof of Payment (POP) below.*\nPlease verify and confirm dispatch with The Courier Guy. Ke a leboga!`;

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
