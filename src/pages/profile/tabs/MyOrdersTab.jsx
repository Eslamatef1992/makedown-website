import { useEffect, useState } from 'react';
import { getMyOrder, listMyOrders } from '../../../api/me.api';
import { ChevronDownIcon } from '../../../components/ui/icons';

const STATUS_COLORS = {
  pending: 'text-espresso-500',
  processing: 'text-carissma-500',
  paid: 'text-green-600',
  shipped: 'text-carissma-500',
  delivered: 'text-green-600',
  cancelled: 'text-carnation-500',
  refunded: 'text-carnation-500',
};

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!open && !detail) {
      setLoading(true);
      try {
        const data = await getMyOrder(order.id);
        setDetail(data);
      } catch {
        // leave detail empty — the summary row still shows
      } finally {
        setLoading(false);
      }
    }
    setOpen((o) => !o);
  };

  return (
    <div className="rounded-2xl border border-carissma-100 bg-white/70 p-4">
      <button onClick={toggle} className="flex w-full items-center justify-between gap-3 text-start">
        <div>
          <p className="text-sm font-bold text-espresso-900">#{order.order_number}</p>
          <p className="text-xs font-semibold text-espresso-500">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-end">
            <p className="text-sm font-bold text-espresso-900">
              {Number(order.grand_total).toFixed(3)} {order.currency}
            </p>
            <p className={`text-xs font-bold uppercase ${STATUS_COLORS[order.status] || 'text-espresso-500'}`}>{order.status}</p>
          </div>
          <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-carissma-100 pt-3">
          {loading && <p className="text-xs font-semibold text-espresso-500">Loading items…</p>}
          {!loading &&
            detail?.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-espresso-700">
                  {item.product_name_snapshot} <span className="text-espresso-400">× {item.quantity}</span>
                </span>
                <span className="font-bold text-espresso-900">
                  {Number(item.line_total).toFixed(3)} {order.currency}
                </span>
              </div>
            ))}
          <p className="pt-1 text-xs font-semibold text-espresso-500">
            Payment: {order.payment_method || 'n/a'} · {order.payment_status}
          </p>
        </div>
      )}
    </div>
  );
}

export default function MyOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    listMyOrders()
      .then((result) => {
        setOrders(result?.rows || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') return <p className="text-center text-sm font-semibold text-espresso-500">Loading orders…</p>;
  if (state === 'error') return <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load your orders right now.</p>;
  if (orders.length === 0) return <p className="text-center text-sm font-semibold text-espresso-500">You haven't placed any orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
}
