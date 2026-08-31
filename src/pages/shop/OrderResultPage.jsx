import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { CheckIcon, CloseIcon } from '../../components/ui/icons';
import { trackOrder } from '../../api/content.api';

const FAILURE_MESSAGES = {
  not_paid: 'Your payment was not completed — it may have been declined or cancelled.',
  status_check_failed: "We couldn't confirm your payment due to a network error. If any amount was deducted, it will be refunded automatically.",
  missing_reference: 'Something went wrong starting the payment. Please try again.',
  order_not_found: "We couldn't find this order. Please try again.",
};

const PAYMENT_METHOD_LABELS = { knet: 'KNET', credit_card: 'Credit Card', cash: 'Cash On Delivery' };

function formatAddress(shippingAddressJson) {
  if (!shippingAddressJson) return '';
  try {
    const a = typeof shippingAddressJson === 'string' ? JSON.parse(shippingAddressJson) : shippingAddressJson;
    return [a.governorate, a.area, a.block && `Block ${a.block}`, a.street].filter(Boolean).join(', ');
  } catch {
    return '';
  }
}

function itemAttrs(item) {
  const attrs = item.variantAttrs || {};
  const colorKey = Object.keys(attrs).find((k) => k.toLowerCase() === 'color');
  const widthKey = Object.keys(attrs).find((k) => k.toLowerCase() === 'width');
  const heightKey = Object.keys(attrs).find((k) => k.toLowerCase() === 'height');
  return {
    color: colorKey ? attrs[colorKey] : null,
    width: widthKey ? attrs[widthKey] : null,
    height: heightKey ? attrs[heightKey] : null,
  };
}

export default function OrderResultPage({ status: initialStatus }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order && Boolean(searchParams.get('orderNumber')));
  const cartItemsSnapshot = location.state?.cartItemsSnapshot || [];
  const message = location.state?.message;

  const status = searchParams.get('status') || initialStatus;
  const reason = searchParams.get('reason');
  const orderNumber = searchParams.get('orderNumber');
  const isSuccess = status === 'success';

  useEffect(() => {
    if (!order && orderNumber) {
      trackOrder(orderNumber)
        .then(setOrder)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [order, orderNumber]);

  if (!isSuccess) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-carnation-500">
              <CloseIcon className="h-6 w-6 text-white" />
            </div>
          </div>

          <StickerHeading as="h1" className="mt-6 text-2xl">
            We Couldn't Place Your Order
          </StickerHeading>

          <p className="mt-4 text-espresso-600">{message || FAILURE_MESSAGES[reason] || 'Something went wrong while placing your order. Please try again.'}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/products" className="rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500">
              Continue Shopping
            </Link>
            <Link to="/checkout" className="rounded-full border-2 border-carissma-400 px-8 py-3 font-bold text-carissma-500 hover:bg-carissma-50">
              Try Again
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-8 py-24 text-center text-espresso-500">Loading…</div>
      </SiteLayout>
    );
  }

  const items = order?.items || [];
  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const currency = order?.currency || 'KWD';

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckIcon className="h-16 w-16" />
        </div>

        <StickerHeading as="h1" className="mt-6 text-2xl">
          Payment Successful!
        </StickerHeading>
        <p className="mt-3 text-espresso-600">Your Order Has Been Successfully Placed &amp; Is Being Prepared For Shipped.</p>

        {order && (
          <>
            <div className="mt-8 rounded-2xl bg-white p-6 text-start shadow-sm">
              <p className="text-sm font-bold text-carissma-400">Order Summary</p>
              <div className="mt-3 space-y-2.5 border-t border-linen-200 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold text-carnation-500">Order Id</span>
                  <span className="font-bold text-espresso-900">#{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-carnation-500">No Of Items</span>
                  <span className="font-bold text-espresso-900">{itemCount} Item{itemCount === 1 ? '' : 's'}</span>
                </div>
                {order.shipping_address_json && (
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 font-bold text-carnation-500">Address</span>
                    <span className="text-end font-bold text-espresso-900">{formatAddress(order.shipping_address_json)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-bold text-carnation-500">Payment Status</span>
                  <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-carissma-500'}`}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-carnation-500">Payment Method</span>
                  <span className="font-bold text-espresso-900">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-carnation-500">Add Delivery Fees</span>
                  <span className="font-bold text-espresso-900">{Number(order.shipping_total).toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between border-t border-linen-200 pt-2.5">
                  <span className="font-bold text-carnation-500">Total</span>
                  <span className="font-extrabold text-espresso-900">{Number(order.grand_total).toFixed(0)} {currency}</span>
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div className="mt-5 rounded-2xl bg-white p-6 text-start shadow-sm">
                <p className="text-sm font-bold text-carissma-400">Orders</p>
                <div className="mt-3 space-y-3 border-t border-linen-200 pt-3">
                  {items.map((it) => {
                    // Prefer the richer cart snapshot for image/color/W/H when
                    // this came straight from checkout; the server item
                    // (joined to the product/variant) covers the redirect-back
                    // case where there is no snapshot.
                    const snapshot = cartItemsSnapshot.find(
                      (c) => c.productId === it.product_id && (c.variantId ?? null) === (it.variant_id ?? null)
                    );
                    const image = snapshot?.image;
                    let variantAttrs = snapshot?.variantAttrs;
                    if (!variantAttrs && it.attributes_json) {
                      variantAttrs = typeof it.attributes_json === 'string' ? JSON.parse(it.attributes_json) : it.attributes_json;
                    }
                    const { color, width, height } = itemAttrs({ variantAttrs });
                    return (
                      <div key={it.id} className="flex items-center gap-3 rounded-xl bg-carissma-50/60 p-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-linen-100">
                          {(image || it.thumbnail_url) ? (
                            <img src={image || it.thumbnail_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-espresso-300">No image</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-carissma-500">{it.product_name_snapshot}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-espresso-700">
                            {color && (
                              <span className="flex items-center gap-1.5">
                                Color:
                                <span className="inline-block h-3 w-3 rounded-full border border-espresso-200" style={{ backgroundColor: color }} />
                              </span>
                            )}
                            {width && <span>W: {width}</span>}
                            {height && <span>H: {height}</span>}
                          </div>
                        </div>
                        <div className="shrink-0 text-end">
                          <p className="text-xs font-bold text-espresso-700">
                            Qty: <span className="text-carissma-500">{it.quantity}</span>
                          </p>
                          <p className="mt-1 text-sm font-bold text-espresso-900">{Number(it.line_total).toFixed(0)} {currency}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <Link
          to="/products"
          className="mt-8 inline-block w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white hover:bg-carissma-500"
        >
          Continue Shopping
        </Link>
      </div>
    </SiteLayout>
  );
}
