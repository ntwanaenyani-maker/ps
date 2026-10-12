// Transactional email via Brevo (formerly Sendinblue) HTTP API.
// Configure with BREVO_API_KEY, BREVO_SENDER_EMAIL and BREVO_SENDER_NAME.
// All sends fail soft: callers should not break if email is unavailable.

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export function emailConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

function sender() {
  return {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME || 'Phethagatsa Solutions',
  };
}

async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!emailConfigured()) throw new Error('Email is not configured');
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean).map((email) => ({ email }));
  if (!recipients.length) throw new Error('No recipients');

  const res = await fetchWithTimeout(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: sender(),
      to: recipients,
      subject,
      htmlContent: html,
      textContent: text || undefined,
      replyTo: replyTo ? { email: replyTo } : undefined,
      headers: { 'X-Mailer': 'Phethagatsa Solutions' },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Brevo send failed (${res.status})`);
  }
  return data;
}

// ---- templates -----------------------------------------------------------------
const BRAND = {
  name: 'Phethagatsa Solutions',
  email: process.env.BREVO_SENDER_EMAIL || 'support@phethagatsa.co.za',
  phone: process.env.WHATSAPP_NUMBER ? `+${process.env.WHATSAPP_NUMBER}` : '+27 72 381 9402',
};

function layout(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e7e5e4;">
        <tr><td style="background:#1c1917;color:#ffffff;padding:20px 28px;">
          <div style="font-size:18px;font-weight:bold;letter-spacing:1px;">Phethagatsa Solutions</div>
          <div style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:2px;">Modern African Skincare</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:18px;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#fafaf9;border-top:1px solid #e7e5e4;font-size:11px;color:#78716c;">
          ${BRAND.name} · ${BRAND.email} · ${BRAND.phone}<br/>
          Bronkhorstspruit · Witbank · Rustenburg, South Africa
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const money = (n, cur = 'ZAR') => `R${Number(n || 0).toFixed(2)}`;

export function orderConfirmationEmail(order) {
  const items = (order.items || [])
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #f5f5f4;">${i.name || i.product?.name || 'Item'} × ${i.quantity || 1}</td>
         <td style="padding:6px 0;border-bottom:1px solid #f5f5f4;text-align:right;">${money((i.price || 0) * (i.quantity || 1), order.currency)}</td></tr>`
    )
    .join('');
  const body = `
    <p style="margin:0 0 16px;">Hi ${order.customer?.fullName || 'there'},</p>
    <p style="margin:0 0 16px;">Thank you for your order <strong>#${order.id || order.orderNumber}</strong>. We've received it and will be in touch shortly.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin:0 0 16px;">${items}</table>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Subtotal:</strong> ${money(order.subtotal, order.currency)}</p>
    ${order.discount ? `<p style="margin:0 0 6px;font-size:13px;"><strong>Discount:</strong> -${money(order.discount, order.currency)}</p>` : ''}
    <p style="margin:0 0 6px;font-size:13px;"><strong>Shipping:</strong> ${order.shipping ? money(order.shipping, order.currency) : 'Free'}</p>
    <p style="margin:0 0 16px;font-size:15px;"><strong>Total:</strong> ${money(order.total, order.currency)}</p>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Payment method:</strong> ${order.paymentMethod || 'EFT'}</p>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Deliver to:</strong> ${order.customer?.address || ''}, ${order.customer?.city || ''}, ${order.customer?.postalCode || ''}</p>
    <p style="margin:16px 0 0;">Ke a leboga,<br/>The Phethagatsa team</p>`;
  return { subject: `Order #${order.id || order.orderNumber} confirmed`, html: layout('Order confirmed', body) };
}

export function orderAdminEmail(order) {
  const body = `
    <p style="margin:0 0 16px;">A new order was placed.</p>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Order:</strong> #${order.id || order.orderNumber}</p>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Customer:</strong> ${order.customer?.fullName} (${order.customer?.email}, ${order.customer?.phone})</p>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Total:</strong> ${money(order.total, order.currency)}</p>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Payment:</strong> ${order.paymentMethod || 'EFT'}</p>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Address:</strong> ${order.customer?.address}, ${order.customer?.city} ${order.customer?.postalCode}</p>
    <p style="margin:0 0 6px;font-size:13px;"><strong>Items:</strong> ${(order.items || []).map((i) => `${i.name || i.product?.name} ×${i.quantity || 1}`).join(', ')}</p>`;
  return { subject: `New order #${order.id || order.orderNumber}`, html: layout('New order received', body) };
}

export function orderPaidEmail(order) {
  const body = `
    <p style="margin:0 0 16px;">Hi ${order.customer?.fullName || 'there'},</p>
    <p style="margin:0 0 16px;">We've received your payment for order <strong>#${order.id || order.orderNumber}</strong> (${money(order.total, order.currency)}). Your order is now confirmed and being prepared.</p>
    <p style="margin:16px 0 0;">Ke a leboga,<br/>The Phethagatsa team</p>`;
  return { subject: `Payment received for order #${order.id || order.orderNumber}`, html: layout('Payment received', body) };
}

export function otpEmail(code, purpose = 'verify') {
  const reason =
    purpose === 'reset_password'
      ? 'reset your password'
      : purpose === 'verify_email'
        ? 'verify your email address'
        : 'confirm your identity';
  const body = `
    <p style="margin:0 0 16px;">Use the code below to ${reason}.</p>
    <p style="margin:0 0 16px;font-size:30px;font-weight:bold;letter-spacing:8px;">${code}</p>
    <p style="margin:0 0 16px;font-size:13px;color:#78716c;">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>`;
  return { subject: 'Your Phethagatsa verification code', html: layout('Your verification code', body) };
}
