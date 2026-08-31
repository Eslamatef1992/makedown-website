import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { useCart } from '../../context/CartContext';
import { MinusIcon, PlusIcon, TrashIcon } from '../../components/ui/icons';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState('');

  const currency = items[0]?.currency || 'KWD';
  // Delivery and discount aren't priced client-side — the checkout endpoint
  // recomputes everything server-side, this is just an estimate preview.
  const grandTotal = subtotal;

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-8">
          <StickerHeading as="h1" className="text-2xl">
            Your Cart
          </StickerHeading>
          <p className="mt-4 text-espresso-600">Your cart is empty.</p>
          <Link
            to="/products"
            className="mt-8 inline-block rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500"
          >
            Continue Shopping
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <StickerHeading as="h1" className="text-2xl">
          Your Cart
        </StickerHeading>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? 'base'}`}
                className="flex items-center gap-4 rounded-2xl border border-carissma-100 bg-white/70 p-4"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-linen-100">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-espresso-300">No image</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-espresso-900">{item.name}</p>
                  {item.variantLabel && <p className="mt-0.5 text-xs font-semibold text-espresso-500">{item.variantLabel}</p>}
                  <p className="mt-1 text-sm font-bold text-carissma-600">
                    {Number(item.price).toFixed(3)} {item.currency}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-carissma-200 px-2.5 py-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-carissma-500 hover:bg-carissma-50"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-bold text-espresso-900">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-carissma-500 hover:bg-carissma-50"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-carnation-500 hover:bg-carnation-50"
                  aria-label="Remove item"
                >
                  <TrashIcon className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}

            <Link to="/products" className="inline-block text-sm font-bold text-carissma-500 hover:underline">
              ← Continue Shopping
            </Link>
          </div>

          <div className="h-fit rounded-2xl border border-carissma-100 bg-white/70 p-6">
            <p className="text-sm font-bold text-espresso-800">Discount Code</p>
            <div className="mt-2 flex gap-2">
              <input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter code"
                className="w-full rounded-full border border-carissma-200 bg-white px-4 py-2 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
              />
            </div>

            <div className="mt-6 space-y-2 border-t border-carissma-100 pt-4 text-sm">
              <div className="flex justify-between text-espresso-700">
                <span>Subtotal</span>
                <span className="font-semibold">{subtotal.toFixed(3)} {currency}</span>
              </div>
              <div className="flex justify-between text-espresso-700">
                <span>Delivery</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between border-t border-carissma-100 pt-2 text-base font-bold text-espresso-900">
                <span>Total</span>
                <span>{grandTotal.toFixed(3)} {currency}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { discountCode } })}
              className="mt-6 w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white transition hover:bg-carissma-500"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
