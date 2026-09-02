// Shared between MyOrdersTab.jsx (the order list) and OrderDetailsDrawer.jsx
// (the "View" slide-over) so both read the same order shape the same way.

// labelKey resolves through i18next ("profile.orderStatus.<status>" /
// "shop.checkout.<method>") — this module has no hook access, so the
// consuming components call t(meta.labelKey) themselves.
export const STATUS_META = {
  pending: { labelKey: 'profile.orderStatus.pending', dot: 'bg-espresso-300', pill: 'bg-linen-100 text-espresso-500' },
  processing: { labelKey: 'profile.orderStatus.processing', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-600' },
  shipped: { labelKey: 'profile.orderStatus.shipped', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-600' },
  paid: { labelKey: 'profile.orderStatus.paid', dot: 'bg-green-500', pill: 'bg-green-50 text-green-600' },
  delivered: { labelKey: 'profile.orderStatus.delivered', dot: 'bg-green-500', pill: 'bg-green-50 text-green-600' },
  cancelled: { labelKey: 'profile.orderStatus.cancelled', dot: 'bg-carnation-500', pill: 'bg-carnation-50 text-carnation-600' },
  refunded: { labelKey: 'profile.orderStatus.refunded', dot: 'bg-carnation-500', pill: 'bg-carnation-50 text-carnation-600' },
};

// Reuses the Shop checkout's payment-method translations (KNET / Credit Card
// / Cash On Delivery already exist there and read identically here).
export const PAYMENT_METHOD_KEYS = { knet: 'shop.checkout.knet', credit_card: 'shop.checkout.creditCard', cash: 'shop.checkout.cashOnDelivery' };

// Same multi-directional white text-shadow used by StickerHeading.jsx and
// PackageCard.jsx — kept as a plain style object here (rather than reusing
// StickerHeading) because that component forces uppercase text and the
// reference design keeps "Order Details" in title case.
export const STICKER_SHADOW = {
  textShadow: '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
};

export function itemAttrs(item) {
  const attrs = item.attributes_json || {};
  const key = (name) => Object.keys(attrs).find((k) => k.toLowerCase() === name);
  const colorKey = key('color');
  const widthKey = key('width');
  const heightKey = key('height');
  return {
    color: colorKey ? attrs[colorKey] : null,
    width: widthKey ? attrs[widthKey] : null,
    height: heightKey ? attrs[heightKey] : null,
  };
}

export function formatPrice(value, currency) {
  const num = Number(value) || 0;
  const rounded = Math.round(num) === num ? num.toFixed(0) : num.toFixed(2);
  return `${rounded} ${currency === 'KWD' ? 'Kwd' : currency}`;
}

// Same field set (and "Block <n>" formatting) CheckoutPage.jsx collects and
// OrderResultPage.jsx already displays, so an order's address reads the
// same way whether you're looking at the just-placed confirmation or
// looking it up later from My Orders.
export function formatShippingAddress(shippingAddressJson) {
  if (!shippingAddressJson) return '';
  try {
    const a = typeof shippingAddressJson === 'string' ? JSON.parse(shippingAddressJson) : shippingAddressJson;
    return [a.governorate, a.area, a.block && `Block ${a.block}`, a.street].filter(Boolean).join(', ');
  } catch {
    return '';
  }
}

// "1, Mar 2026" — day, short month, year, matching the reference design.
export function formatOrderDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day}, ${month} ${year}`;
}

// Whole-number percentage the flat discount_total represents of the
// subtotal — the order only stores the currency amount, so this is a
// display-only approximation for the "Discount 0%" summary line.
export function discountPercent(order) {
  const subtotal = Number(order?.subtotal) || 0;
  const discount = Number(order?.discount_total) || 0;
  if (subtotal <= 0) return 0;
  return Math.round((discount / subtotal) * 100);
}
