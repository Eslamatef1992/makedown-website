import { useEffect, useState } from 'react';
import { getMyOrder, listMyOrders } from '../../../api/me.api';
import { STATUS_META, itemAttrs, formatPrice } from './orderShared';
import OrderDetailsDrawer from './OrderDetailsDrawer';

// One card per order (its first item as the preview, matching the design),
// not one card per line item — "View" opens the full itemized breakdown in
// OrderDetailsDrawer instead of an inline expand.
function OrderCard({ order, onView }) {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const item = (order.items || [])[0];
  if (!item) return null;
  const { color, width, height } = itemAttrs(item);

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border-2 border-carissma-300 bg-white">
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-sm font-bold text-espresso-500">
          Order Id: <span className="text-espresso-900">#{order.order_number}</span>
        </p>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-carissma-100 px-5 py-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-linen-100">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.product_name_snapshot} className="h-full w-full object-cover" />
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
          <p className="mt-1 text-sm font-extrabold text-carissma-500">{formatPrice(item.line_total, order.currency)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onView(order)}
        className="mt-auto w-full bg-carissma-300 py-3 text-sm font-bold text-white hover:bg-carissma-400"
      >
        View
      </button>
    </div>
  );
}

export default function MyOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState('loading');
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    listMyOrders()
      .then(async (result) => {
        const rows = result?.rows || [];
        const details = await Promise.all(rows.map((o) => getMyOrder(o.id).catch(() => null)));
        setOrders(details.filter(Boolean));
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') return <p className="text-center text-sm font-semibold text-espresso-500">Loading orders…</p>;
  if (state === 'error') return <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load your orders right now.</p>;
  if (orders.length === 0) return <p className="text-center text-sm font-semibold text-espresso-500">You haven't placed any orders yet.</p>;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onView={setViewingOrder} />
        ))}
      </div>
      {viewingOrder && <OrderDetailsDrawer order={viewingOrder} onClose={() => setViewingOrder(null)} />}
    </>
  );
}
