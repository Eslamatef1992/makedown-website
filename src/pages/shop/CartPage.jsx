import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { validateCoupon, getDeliveryFee } from '../../api/content.api';
import { MinusIcon, PlusIcon, TrashIcon } from '../../components/ui/icons';
import knetIcon from '../../assets/payment/knet.svg';
import cardsIcon from '../../assets/payment/cards.svg';

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

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { formatPrice } = useCurrency();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [discount, setDiscount] = useState(null); // { code, discountTotal } | null
  const [discountError, setDiscountError] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    getDeliveryFee()
      .then((data) => setDeliveryFee(Number(data?.fee) || 0))
      .catch(() => setDeliveryFee(0));
  }, []);

  const discountTotal = discount?.discountTotal || 0;
  const grandTotal = Math.max(0, subtotal - discountTotal + deliveryFee);
  const discountPercent = discount ? (subtotal ? Math.round((discountTotal / subtotal) * 100) : 0) : 0;

  const onApply = async () => {
    if (!discountCode.trim() || applying) return;
    setApplying(true);
    setDiscountError('');
    try {
      const result = await validateCoupon(discountCode.trim(), subtotal);
      setDiscount(result);
    } catch (err) {
      setDiscount(null);
      setDiscountError(err.response?.data?.message || t('shop.cart.invalidCode'));
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-8">
          <StickerHeading as="h1" className="text-2xl">
            {t('shop.cart.title')}
          </StickerHeading>
          <p className="mt-4 text-espresso-600">{t('shop.cart.empty')}</p>
          <Link
            to="/products"
            className="mt-8 inline-block rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500"
          >
            {t('shop.cart.continueShopping')}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border-2 border-carissma-300 bg-white p-6">
            <div className="flex items-center justify-between">
              <StickerHeading as="h1" className="text-xl">
                {t('shop.cart.title')}
              </StickerHeading>
              <Link to="/products" className="text-sm font-bold text-carissma-500 underline hover:text-carissma-600">
                {t('shop.cart.continueShopping')}
              </Link>
            </div>

            <div className="mt-5 divide-y divide-carissma-100 border-t border-carissma-100">
              {items.map((item) => {
                const { color, width, height } = itemAttrs(item);
                const displayName = (i18n.language?.startsWith('ar') && item.nameAr) || item.name;
                return (
                  <div key={`${item.productId}-${item.variantId ?? 'base'}-${item.giftBox ? 'gift' : 'plain'}`} className="flex flex-wrap items-center gap-3 py-4 sm:flex-nowrap sm:gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-linen-100">
                      {item.image ? (
                        <img src={item.image} alt={displayName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-espresso-300">{t('common.noImage')}</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-carissma-500">{displayName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs font-semibold text-espresso-700">
                        {color && (
                          <span className="flex items-center gap-1.5">
                            {t('shop.cart.color')}
                            <span className="inline-block h-3.5 w-3.5 rounded-full border border-espresso-200" style={{ backgroundColor: color }} />
                          </span>
                        )}
                        {width && <span>{t('shop.cart.width', { value: width })}</span>}
                        {height && <span>{t('shop.cart.height', { value: height })}</span>}
                        {item.giftBox && <span className="text-carissma-500">{t('shop.cart.giftBoxed')}</span>}
                      </div>
                    </div>

                    {/* On mobile this whole group wraps onto its own full-width row (quantity
                       stepper, price, and — crucially — the delete button, which was previously
                       getting squeezed off-screen next to the fixed-width image/stepper/price on
                       narrow viewports). From sm: up, `sm:contents` removes this wrapper from the
                       box model so its children rejoin the single-row desktop layout unchanged. */}
                    <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:contents">
                      <div className="flex items-center gap-2 rounded-full border border-carissma-200 px-2.5 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1, item.giftBox)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-carissma-500 hover:bg-carissma-50"
                          aria-label={t('shop.cart.decreaseQuantity')}
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-4 text-center text-sm font-bold text-espresso-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1, item.giftBox)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-carissma-500 hover:bg-carissma-50"
                          aria-label={t('shop.cart.increaseQuantity')}
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="shrink-0 text-end text-sm font-bold text-carissma-600 sm:w-20">
                        {formatPrice(item.price)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variantId, item.giftBox)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-carnation-500 hover:bg-carnation-50"
                        aria-label={t('shop.cart.removeItem')}
                      >
                        <TrashIcon className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-fit rounded-3xl bg-linen-50 p-6">
            <div className="flex gap-2">
              <input
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value);
                  setDiscount(null);
                  setDiscountError('');
                }}
                placeholder={t('shop.cart.discountCodePlaceholder')}
                className="w-full rounded-full border border-carissma-100 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
              />
              <button
                type="button"
                onClick={onApply}
                disabled={applying}
                className="shrink-0 rounded-full bg-carissma-300 px-6 text-sm font-bold text-white hover:bg-carissma-400 disabled:opacity-60"
              >
                {applying ? '…' : t('shop.cart.apply')}
              </button>
            </div>
            {discountError && <p className="mt-2 text-xs font-semibold text-carnation-600">{discountError}</p>}
            {discount && <p className="mt-2 text-xs font-semibold text-carissma-600">{t('shop.cart.couponApplied', { code: discount.code })}</p>}

            <div className="mt-6 space-y-3 border-t border-carissma-200 pt-5 text-sm">
              <div className="flex justify-between font-bold text-espresso-900">
                <span>{t('shop.cart.subtotal')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-carnation-500">
                <span>{t('shop.cart.discount')}</span>
                <span>{discount ? `${discountPercent}%` : '0%'}</span>
              </div>
              <div className="flex justify-between font-bold text-espresso-900">
                <span>{t('shop.cart.deliveryFees')}</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-carissma-200 pt-4 text-base font-extrabold text-espresso-900">
              <span>{t('shop.cart.total')}</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { discountCode: discount?.code || '' } })}
              className="mt-6 w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white transition hover:bg-carissma-500"
            >
              {t('shop.cart.checkout')}
            </button>

            <div className="mt-5 flex items-center justify-center gap-3">
              <img src={knetIcon} alt="KNET" className="h-6 w-auto" />
              <img src={cardsIcon} alt="Visa / Mastercard" className="h-6 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
