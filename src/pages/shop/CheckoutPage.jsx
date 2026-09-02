import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { checkoutRequest, validateCoupon, getDeliveryFee, getCodSettings } from '../../api/content.api';
import { CloseIcon } from '../../components/ui/icons';
import knetIcon from '../../assets/payment/knet.svg';
import cardsIcon from '../../assets/payment/cards.svg';
import cashIcon from '../../assets/payment/cash.svg';

const KUWAIT_AREAS = {
  'Al Asimah': [
    'Kuwait City', 'Sharq', 'Mirqab', 'Qibla', 'Dasman', 'Bneid Al Gar', 'Shuwaikh', 'Shamiya',
    'Faiha', 'Qadsiya', 'Nuzha', 'Khaldiya', 'Adailiya', 'Yarmouk', 'Surra', 'Rawda', 'Qurtuba', 'Daiya',
  ],
  Hawalli: ['Hawalli', 'Salmiya', 'Jabriya', 'Bayan', 'Mishref', 'Rumaithiya', 'Salwa', 'Shaab', 'Shuhada', 'Zahra'],
  Farwaniya: [
    'Farwaniya', 'Khaitan', 'Jleeb Al Shuyoukh', 'Abraq Khaitan', 'Ardiya', 'Rai', 'Rabiya', 'Andalous', 'Omariya', 'Sabah Al Nasser',
  ],
  'Mubarak Al-Kabeer': ['Mubarak Al Kabeer', 'Qurain', 'Qusor', 'Adan', 'Sabah Al Salem', 'Messila', 'Fnaitees'],
  Ahmadi: ['Ahmadi', 'Fahaheel', 'Mangaf', 'Abu Halifa', 'Fintas', 'Mahboula', 'Riqqa', 'Sabahiya', 'Egaila', 'Jaber Al Ali'],
  Jahra: ['Jahra', 'Sulaibiya', 'Naeem', 'Qasr', 'Waha', 'Taima', 'Oyoun', 'Amghara', 'Nasseem'],
};
const GOVERNORATES = Object.keys(KUWAIT_AREAS);

// The submitted/stored address always uses these English names (unchanged,
// so existing orders and the backend stay consistent) — this table only
// swaps the *displayed* option label to Arabic when the site is in Arabic.
const AREA_LABELS_AR = {
  'Al Asimah': 'العاصمة',
  Hawalli: 'حولي',
  Farwaniya: 'الفروانية',
  'Mubarak Al-Kabeer': 'مبارك الكبير',
  Ahmadi: 'الأحمدي',
  Jahra: 'الجهراء',
  'Kuwait City': 'مدينة الكويت',
  Sharq: 'شرق',
  Mirqab: 'المرقاب',
  Qibla: 'القبلة',
  Dasman: 'دسمان',
  'Bneid Al Gar': 'بنيد القار',
  Shuwaikh: 'الشويخ',
  Shamiya: 'الشامية',
  Faiha: 'الفيحاء',
  Qadsiya: 'القادسية',
  Nuzha: 'النزهة',
  Khaldiya: 'الخالدية',
  Adailiya: 'العديلية',
  Yarmouk: 'اليرموك',
  Surra: 'السرة',
  Rawda: 'الروضة',
  Qurtuba: 'قرطبة',
  Daiya: 'الدعية',
  Salmiya: 'السالمية',
  Jabriya: 'الجابرية',
  Bayan: 'بيان',
  Mishref: 'مشرف',
  Rumaithiya: 'الرميثية',
  Salwa: 'سلوى',
  Shaab: 'الشعب',
  Shuhada: 'الشهداء',
  Zahra: 'الزهراء',
  Khaitan: 'خيطان',
  'Jleeb Al Shuyoukh': 'جليب الشيوخ',
  'Abraq Khaitan': 'أبرق خيطان',
  Ardiya: 'العارضية',
  Rai: 'الري',
  Rabiya: 'الرابية',
  Andalous: 'الأندلس',
  Omariya: 'العمرية',
  'Sabah Al Nasser': 'صباح الناصر',
  'Mubarak Al Kabeer': 'مبارك الكبير',
  Qurain: 'القرين',
  Qusor: 'القصور',
  Adan: 'العدان',
  'Sabah Al Salem': 'صباح السالم',
  Messila: 'المسيلة',
  Fnaitees: 'الفنيطيس',
  Fahaheel: 'الفحيحيل',
  Mangaf: 'المنقف',
  'Abu Halifa': 'أبو حليفة',
  Fintas: 'الفنطاس',
  Mahboula: 'المهبولة',
  Riqqa: 'الرقة',
  Sabahiya: 'الصباحية',
  Egaila: 'العقيلة',
  'Jaber Al Ali': 'جابر العلي',
  Sulaibiya: 'الصليبية',
  Naeem: 'النعيم',
  Qasr: 'القصر',
  Waha: 'الواحة',
  Taima: 'تيماء',
  Oyoun: 'العيون',
  Amghara: 'امغرة',
  Nasseem: 'النسيم',
};
function areaLabel(name, isAr) {
  return (isAr && AREA_LABELS_AR[name]) || name;
}

const BASE_PAYMENT_METHODS = [
  { value: 'knet', labelKey: 'shop.checkout.knet', icon: knetIcon },
  { value: 'credit_card', labelKey: 'shop.checkout.creditCard', icon: cardsIcon },
];
const CASH_PAYMENT_METHOD = { value: 'cash', labelKey: 'shop.checkout.cashOnDelivery', icon: cashIcon };

function ContinueAsModal({ onClose, onGuest }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/40 px-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-espresso-400 hover:bg-linen-100"
          aria-label={t('common.close')}
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <StickerHeading as="h2" className="text-xl">
          {t('shop.checkout.continueModalTitle')}
        </StickerHeading>
        <div className="mt-6 space-y-3">
          <Button onClick={() => navigate('/register', { state: { redirectTo: '/checkout' } })}>{t('shop.checkout.signup')}</Button>
          <Button variant="outline" onClick={() => navigate('/login', { state: { redirectTo: '/checkout' } })}>
            {t('shop.checkout.login')}
          </Button>
          <button
            onClick={onGuest}
            className="w-full rounded-full py-3.5 font-bold text-espresso-600 underline-offset-4 hover:underline"
          >
            {t('shop.checkout.continueAsGuest')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const location = useLocation();
  const navigate = useNavigate();
  const incomingCode = location.state?.discountCode || '';
  const [discountInput, setDiscountInput] = useState(incomingCode);
  const [discount, setDiscount] = useState(null); // { code, discountTotal } | null
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);

  const [asGuest, setAsGuest] = useState(false);
  const [showModal, setShowModal] = useState(!isAuthenticated);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [address, setAddress] = useState({
    governorate: GOVERNORATES[0],
    area: '',
    block: '',
    street: '',
    buildingNumber: '',
    moreDetails: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('knet');
  const [codEnabled, setCodEnabled] = useState(true);

  const { formatPrice } = useCurrency();
  const canShowForm = isAuthenticated || asGuest;
  // Cash On Delivery for physical products defaults on (it's how the store
  // always worked) but a super admin can turn it off in the admin's Cash On
  // Delivery settings — separate from the packages toggle, since a package
  // is a digital good with different economics.
  const PAYMENT_METHODS = codEnabled ? [...BASE_PAYMENT_METHODS, CASH_PAYMENT_METHOD] : BASE_PAYMENT_METHODS;

  useEffect(() => {
    getDeliveryFee()
      .then((data) => setDeliveryFee(Number(data?.fee) || 0))
      .catch(() => setDeliveryFee(0));

    getCodSettings()
      .then((data) => setCodEnabled(data?.products !== false))
      .catch(() => setCodEnabled(true));
  }, []);

  // If cash gets disabled server-side while it's the selected method, fall
  // back to KNET rather than silently submitting a payment method that's no
  // longer offered.
  useEffect(() => {
    if (!codEnabled && paymentMethod === 'cash') setPaymentMethod('knet');
  }, [codEnabled, paymentMethod]);

  // Apply the code carried over from the cart page once we know the real
  // subtotal here too.
  useEffect(() => {
    if (incomingCode) {
      validateCoupon(incomingCode, subtotal)
        .then(setDiscount)
        .catch(() => setDiscount(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAddressField = (field) => (e) => {
    const value = e.target.value;
    setAddress((a) => (field === 'governorate' ? { ...a, governorate: value, area: '' } : { ...a, [field]: value }));
  };
  const setGuestField = (field) => (e) => setGuest((g) => ({ ...g, [field]: e.target.value }));

  const isFormValid = useMemo(() => {
    if (!address.governorate || !address.area || !address.block || !address.street || !address.buildingNumber) return false;
    if (!isAuthenticated) {
      if (!guest.firstName || !guest.lastName || !guest.email) return false;
    }
    return true;
  }, [address, guest, isAuthenticated]);

  const onApplyDiscount = async () => {
    if (!discountInput.trim() || applyingDiscount) return;
    setApplyingDiscount(true);
    setDiscountError('');
    try {
      const result = await validateCoupon(discountInput.trim(), subtotal);
      setDiscount(result);
    } catch (err) {
      setDiscount(null);
      setDiscountError(err.response?.data?.message || t('shop.checkout.invalidCode'));
    } finally {
      setApplyingDiscount(false);
    }
  };

  const discountTotal = discount?.discountTotal || 0;
  const grandTotal = Math.max(0, subtotal - discountTotal + deliveryFee);

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-8">
          <StickerHeading as="h1" className="text-2xl">
            {t('shop.checkout.title')}
          </StickerHeading>
          <p className="mt-4 text-espresso-600">{t('shop.checkout.empty')}</p>
          <Link to="/products" className="mt-8 inline-block rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500">
            {t('shop.checkout.browseProducts')}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        items: items.map((it) => ({ productId: it.productId, variantId: it.variantId, quantity: it.quantity, giftBox: it.giftBox || undefined })),
        shippingAddress: address,
        paymentMethod,
        discountCode: discount?.code || undefined,
      };
      if (!isAuthenticated) {
        payload.guestName = `${guest.firstName} ${guest.lastName}`.trim();
        payload.guestEmail = guest.email;
        payload.guestPhone = guest.phone || undefined;
      }
      const order = await checkoutRequest(payload);
      if (order.redirectUrl) {
        // knet / credit_card — hand off to MyFatoorah's hosted payment page.
        // The cart is only cleared once payment actually clears (the
        // MyFatoorah callback redirects back to /order-placed).
        window.location.href = order.redirectUrl;
        return;
      }
      clearCart();
      navigate('/order-placed', { state: { order, cartItemsSnapshot: items } });
    } catch (err) {
      const message = err?.response?.data?.message || t('shop.checkout.genericError');
      setError(message);
      navigate('/order-failed', { state: { message } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      {showModal && (
        <ContinueAsModal
          onClose={() => setShowModal(false)}
          onGuest={() => {
            setAsGuest(true);
            setShowModal(false);
          }}
        />
      )}

      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <StickerHeading as="h1" className="text-2xl">
          {t('shop.checkout.title')}
        </StickerHeading>

        {!canShowForm && !showModal && (
          <div className="mt-10 rounded-2xl border border-carissma-100 bg-white/70 p-8 text-center">
            <p className="text-espresso-600">{t('shop.checkout.chooseHowToContinue')}</p>
            <button onClick={() => setShowModal(true)} className="mt-4 font-bold text-carissma-600 hover:underline">
              {t('shop.checkout.continue')}
            </button>
          </div>
        )}

        {canShowForm && (
          <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              {!isAuthenticated && (
                <section className="rounded-2xl border border-carissma-100 bg-white/70 p-6">
                  <h2 className="text-sm font-bold text-espresso-900">{t('shop.checkout.personalInformation')}</h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      required
                      value={guest.firstName}
                      onChange={setGuestField('firstName')}
                      placeholder={t('shop.checkout.firstName')}
                      className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                    <input
                      required
                      value={guest.lastName}
                      onChange={setGuestField('lastName')}
                      placeholder={t('shop.checkout.lastName')}
                      className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                    <input
                      required
                      type="email"
                      value={guest.email}
                      onChange={setGuestField('email')}
                      placeholder={t('shop.checkout.email')}
                      className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                    <input
                      value={guest.phone}
                      onChange={setGuestField('phone')}
                      placeholder={t('shop.checkout.phoneNumber')}
                      className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                  </div>
                </section>
              )}

              <section className="rounded-3xl border-2 border-carissma-300 bg-white p-6">
                <StickerHeading as="h2" className="text-lg">
                  {t('shop.checkout.deliveryAddress')}
                </StickerHeading>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                      {t('shop.checkout.governorate')} <span className="text-carnation-500">*</span>
                    </span>
                    <select
                      required
                      value={address.governorate}
                      onChange={setAddressField('governorate')}
                      className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    >
                      {GOVERNORATES.map((g) => (
                        <option key={g} value={g}>{areaLabel(g, isAr)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                      {t('shop.checkout.area')} <span className="text-carnation-500">*</span>
                    </span>
                    <select
                      required
                      value={address.area}
                      onChange={setAddressField('area')}
                      className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    >
                      <option value="">{t('shop.checkout.selectArea')}</option>
                      {(KUWAIT_AREAS[address.governorate] || []).map((a) => (
                        <option key={a} value={a}>{areaLabel(a, isAr)}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                        {t('shop.checkout.block')} <span className="text-carnation-500">*</span>
                      </span>
                      <input
                        required
                        value={address.block}
                        onChange={setAddressField('block')}
                        placeholder={t('shop.checkout.enterBlock')}
                        className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                        {t('shop.checkout.street')} <span className="text-carnation-500">*</span>
                      </span>
                      <input
                        required
                        value={address.street}
                        onChange={setAddressField('street')}
                        placeholder={t('shop.checkout.enterStreet')}
                        className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                      {t('shop.checkout.buildNumber')} <span className="text-carnation-500">*</span>
                    </span>
                    <input
                      required
                      value={address.buildingNumber}
                      onChange={setAddressField('buildingNumber')}
                      placeholder={t('shop.checkout.buildNumber')}
                      className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-espresso-900">{t('shop.checkout.moreDetails')}</span>
                    <textarea
                      value={address.moreDetails}
                      onChange={setAddressField('moreDetails')}
                      placeholder={t('shop.checkout.moreDetails')}
                      rows={3}
                      className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-carissma-100 bg-white/70 p-6">
                <h2 className="text-sm font-bold text-espresso-900">{t('shop.checkout.paymentMethod')}</h2>
                <div className="mt-4 space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.value}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                        paymentMethod === m.value
                          ? 'border-carissma-400 bg-carissma-50 text-carissma-600'
                          : 'border-carissma-100 text-espresso-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {t(m.labelKey)}
                        <img src={m.icon} alt="" className="h-6 w-auto shrink-0" />
                      </span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.value}
                        checked={paymentMethod === m.value}
                        onChange={() => setPaymentMethod(m.value)}
                        className="h-4 w-4 shrink-0 accent-carissma-500"
                      />
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="h-fit rounded-3xl border-2 border-carissma-300 bg-linen-50 p-6">
              <StickerHeading as="h2" className="text-lg">
                {t('shop.checkout.myOrder')}
              </StickerHeading>

              <div className="mt-4 space-y-3">
                {items.map((it) => {
                  const attrs = it.variantAttrs || {};
                  const colorKey = Object.keys(attrs).find((k) => k.toLowerCase() === 'color');
                  const otherAttrs = Object.entries(attrs).filter(([k]) => k !== colorKey);
                  const displayName = (isAr && it.nameAr) || it.name;
                  return (
                    <div
                      key={`${it.productId}-${it.variantId ?? 'base'}-${it.giftBox ? 'gift' : 'plain'}`}
                      className="flex items-center gap-3 rounded-2xl bg-white p-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-linen-100">
                        {it.image ? (
                          <img src={it.image} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-espresso-300">{t('common.noImage')}</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-carissma-500">{displayName}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-espresso-700">
                          {colorKey && (
                            <span className="flex items-center gap-1.5">
                              {t('shop.checkout.color')}
                              <span
                                className="inline-block h-3 w-3 rounded-full border border-espresso-200"
                                style={{ backgroundColor: attrs[colorKey] }}
                              />
                            </span>
                          )}
                          {it.giftBox && <span className="text-carissma-500">{t('shop.checkout.giftBoxed')}</span>}
                          {otherAttrs.map(([k, v]) => (
                            <span key={k}>
                              {k[0].toUpperCase()}: <span className="font-bold">{v}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="text-sm font-bold text-espresso-900">
                          {t('shop.checkout.qty')} <span className="text-carissma-500">{it.quantity}</span>
                        </p>
                        <p className="mt-1 text-sm font-bold text-espresso-900">
                          {formatPrice(Number(it.price) * it.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2 rounded-2xl bg-white p-2">
                <input
                  value={discountInput}
                  onChange={(e) => {
                    setDiscountInput(e.target.value);
                    setDiscount(null);
                    setDiscountError('');
                  }}
                  placeholder={t('shop.checkout.discountCodePlaceholder')}
                  className="w-full rounded-xl border border-carissma-100 bg-linen-50 px-4 py-2 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                />
                <button
                  type="button"
                  onClick={onApplyDiscount}
                  disabled={applyingDiscount}
                  className="shrink-0 rounded-xl bg-carissma-400 px-5 text-sm font-bold text-white hover:bg-carissma-500 disabled:opacity-60"
                >
                  {applyingDiscount ? '…' : t('shop.checkout.apply')}
                </button>
              </div>
              {discountError && <p className="mt-1.5 text-xs font-semibold text-carnation-600">{discountError}</p>}
              {discount && (
                <p className="mt-1.5 text-xs font-semibold text-carissma-600">
                  {t('shop.checkout.couponAppliedOff', { code: discount.code, amount: formatPrice(discountTotal) })}
                </p>
              )}

              <div className="mt-4 space-y-2 border-t border-carissma-200 pt-4 text-sm">
                <div className="flex justify-between font-bold text-espresso-900">
                  <span>{t('shop.checkout.subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-carnation-500">
                  <span>{t('shop.checkout.discount')}</span>
                  <span>-{formatPrice(discountTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-espresso-900">
                  <span>{t('shop.checkout.deliveryFees')}</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between border-t border-carissma-200 pt-3 text-base font-extrabold text-espresso-900">
                <span>{t('shop.checkout.total')}</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>

              {error && <p className="mt-4 text-sm font-semibold text-carnation-600">{error}</p>}

              <Button type="submit" loading={submitting} disabled={!isFormValid} className="mt-6">
                {t('shop.checkout.placeOrder')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
