import { useEffect, useState } from 'react';
import { getMyOrder, listMyOrders } from '../../../api/me.api';

const STATUS_META = {
  pending: { label: 'Pending', dot: 'bg-espresso-300', pill: 'bg-linen-100 text-espresso-500' },
  processing: { label: 'Preparing', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-600' },
  shipped: { label: 'On The Way', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-600' },
  paid: { label: 'Paid', dot: 'bg-green-500', pill: 'bg-green-50 text-green-600' },
  delivered: { label: 'Delivered', dot: 'bg-green-500', pill: 'bg-green-50 text-green-600' },
  cancelled: { label: 'Canceled', dot: 'bg-carnation-500', pill: 'bg-carnation-50 text-carnation-600' },
  refunded: { label: 'Refunded', dot: 'bg-carnation-500', pill: 'bg-carnation-50 text-carnation-600' },
};

function itemAttrs(item) {
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

function formatPrice(value, currency) {
  const num = Number(value) || 0;
  const rounded = Math.round(num) === num ? num.toFixed(0) : num.toFixed(2);
  return `${rounded} ${currency === 'KWD' ? 'Kwd' : currency}`;
}

function OrderItemCard({ order, item }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[order.status] || STATUS_META.pending;
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

      {expanded && (
        <div className="space-y-1.5 border-t border-carissma-100 px-5 py-3 text-start text-xs font-semibold text-espresso-600">
          <p>Placed: {new Date(order.created_at).toLocaleDateString()}</p>
          <p>Payment: {order.payment_method || 'n/a'} · {order.payment_status}</p>
          <p>Total: {formatPrice(order.grand_total, order.currency)}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-auto w-full bg-carissma-300 py-3 text-sm font-bold text-white hover:bg-carissma-400"
      >
        {expanded ? 'Hide' : 'View'}
      </button>
    </div>
  );
}

export default function MyOrdersTab() {
  const [cards, setCards] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    listMyOrders()
      .then(async (result) => {
        const orders = result?.rows || [];
        const details = await Promise.all(orders.map((o) => getMyOrder(o.id).catch(() => null)));
        const built = [];
        details.forEach((order) => {
          if (!order) return;
          (order.items || []).forEach((item) => built.push({ order, item }));
        });
        setCards(built);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') return <p className="text-center text-sm font-semibold text-espresso-500">Loading orders…</p>;
  if (state === 'error') return <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load your orders right now.</p>;
  if (cards.length === 0) return <p className="text-center text-sm font-semibold text-espresso-500">You haven't placed any orders yet.</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map(({ order, item }) => (
        <OrderItemCard key={item.id} order={order} item={item} />
      ))}
    </div>
  );
}
