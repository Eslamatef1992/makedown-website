import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CloseIcon } from '../../../components/ui/icons';
import {
  STATUS_META,
  PAYMENT_METHOD_LABELS,
  STICKER_SHADOW,
  itemAttrs,
  formatPrice,
  formatShippingAddress,
  formatOrderDate,
  discountPercent,
} from './orderShared';

// The right-side "Order Details" panel opened from a My Orders card's View
// button. Pure presentation — MyOrdersTab already fetched the full order
// (items included) via getMyOrder, so this never calls the API itself.
export default function OrderDetailsDrawer({ order, onClose }) {
  const { user } = useAuth();

  // Match the site's other overlays: Escape closes, and background scroll
  // is locked while the drawer is open.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!order) return null;

  const items = order.items || [];
  const currency = order.currency || 'KWD';
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const fullName = user?.fullName || order.guest_name || 'Guest';
  const phone = user?.phone || order.guest_phone || '—';
  const address = formatShippingAddress(order.shipping_address_json);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close order details"
        onClick={onClose}
        className="absolute inset-0 bg-espresso-950/40"
      />

      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto rounded-s-[2rem] border-s-4 border-carissma-400 bg-carissma-50 p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-carissma-200 pb-4">
          <p className="text-xl font-extrabold text-carissma-400" style={STICKER_SHADOW}>
            Order Details
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-carissma-400 hover:bg-carissma-100"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <img src="/logo-mark.png" alt="Make Down" className="h-16 w-16 shrink-0 object-contain" />
          <div className="text-end">
            <p className="text-sm font-bold text-espresso-600">Order Id</p>
            <p className="mt-1 text-base font-extrabold text-espresso-900">#{order.order_number}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-carissma-200 pt-5 text-sm">
          <div>
            <p className="font-bold text-espresso-600">Full Name:</p>
            <p className="mt-1 font-extrabold text-espresso-900">{fullName}</p>
          </div>
          <div className="text-end">
            <p className="font-bold text-espresso-600">Payment Method:</p>
            <p className="mt-1 font-extrabold text-espresso-900">
              {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method || '—'}
            </p>
          </div>
          <div>
            <p className="font-bold text-espresso-600">Phone Number:</p>
            <p className="mt-1 font-extrabold text-espresso-900">{phone}</p>
          </div>
          <div className="text-end">
            <p className="font-bold text-espresso-600">Date:</p>
            <p className="mt-1 font-extrabold text-espresso-900">{formatOrderDate(order.created_at)}</p>
          </div>
          <div>
            <p className="font-bold text-espresso-600">Address:</p>
            <p className="mt-1 font-extrabold text-espresso-900">{address || '—'}</p>
          </div>
          <div className="text-end">
            <p className="font-bold text-espresso-600">Order Status:</p>
            <p className="mt-1 font-extrabold text-espresso-900">{meta.label}</p>
          </div>
        </div>

        <p className="mt-6 text-base font-extrabold text-espresso-900">My Order</p>
        <div className="mt-3 space-y-3">
          {items.map((item) => {
            const { color, width, height } = itemAttrs(item);
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-carissma-100 p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-espresso-300">No image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-carissma-500">{item.product_name_snapshot}</p>
                  {color && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-espresso-700">
                      Color: <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                    </p>
                  )}
                  {(width || height) && (
                    <p className="mt-1 text-xs font-bold text-espresso-700">
                      {width && <>W: {width} Cm </>}
                      {height && <>H: {height} Cm</>}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-sm font-bold text-espresso-900">
                    Qty: <span className="font-extrabold">{item.quantity}</span>
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-carissma-400">{formatPrice(item.line_total, currency)}</p>
                </div>
              </div>
            );
          })}
          {items.length === 0 && <p className="text-sm font-semibold text-espresso-400">No items on this order.</p>}
        </div>

        <div className="mt-5 space-y-2.5 rounded-2xl bg-white/70 p-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-espresso-900">Subtotal</span>
            <span className="font-extrabold text-espresso-900">{formatPrice(order.subtotal, currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-carnation-600">Discount</span>
            <span className="font-extrabold text-carnation-600">{discountPercent(order)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-espresso-900">Delivery Fees</span>
            <span className="font-extrabold text-espresso-900">{formatPrice(order.shipping_total, currency)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-carissma-200 pt-2.5">
            <span className="font-bold text-carissma-400">Total</span>
            <span className="font-extrabold text-carissma-400">{formatPrice(order.grand_total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
