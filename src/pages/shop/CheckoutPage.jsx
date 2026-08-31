import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { checkoutRequest, validateCoupon, getDeliveryFee } from '../../api/content.api';
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

const PAYMENT_METHODS = [
  { value: 'knet', label: 'KNET', icon: knetIcon },
  { value: 'credit_card', label: 'Credit Card', icon: cardsIcon },
  { value: 'cash', label: 'Cash On Delivery', icon: cashIcon },
];

function ContinueAsModal({ onClose, onGuest }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/40 px-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-espresso-400 hover:bg-linen-100"
          aria-label="Close"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <StickerHeading as="h2" className="text-xl">
          How Would You Like To Continue?
        </StickerHeading>
        <div className="mt-6 space-y-3">
          <Button onClick={() => navigate('/register', { state: { redirectTo: '/checkout' } })}>Signup</Button>
          <Button variant="outline" onClick={() => navigate('/login', { state: { redirectTo: '/checkout' } })}>
            Login
          </Button>
          <button
            onClick={onGuest}
            className="w-full rounded-full py-3.5 font-bold text-espresso-600 underline-offset-4 hover:underline"
          >
            Continue As A Guest
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
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

  const currency = items[0]?.currency || 'KWD';
  const canShowForm = isAuthenticated || asGuest;

  useEffect(() => {
    getDeliveryFee()
      .then((data) => setDeliveryFee(Number(data?.fee) || 0))
      .catch(() => setDeliveryFee(0));
  }, []);

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
      setDiscountError(err.response?.data?.message || 'That code is not valid.');
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
            Checkout
          </StickerHeading>
          <p className="mt-4 text-espresso-600">Your cart is empty — add something first.</p>
          <Link to="/products" className="mt-8 inline-block rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500">
            Browse Products
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
        items: items.map((it) => ({ productId: it.productId, variantId: it.variantId, quantity: it.quantity })),
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
      const message = err?.response?.data?.message || 'We could not place your order. Please check your details and try again.';
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
          Checkout
        </StickerHeading>

        {!canShowForm && !showModal && (
          <div className="mt-10 rounded-2xl border border-carissma-100 bg-white/70 p-8 text-center">
            <p className="text-espresso-600">Choose how you'd like to continue to checkout.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 font-bold text-carissma-600 hover:underline">
              Continue
            </button>
          </div>
        )}

        {canShowForm && (
          <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              {!isAuthenticated && (
                <section className="rounded-2xl border border-carissma-100 bg-white/70 p-6">
                  <h2 className="text-sm font-bold text-espresso-900">Personal Information</h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      required
                      value={guest.firstName}
                      onChange={setGuestField('firstName')}
                      placeholder="First Name"
                      className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                    <input
                      required
                      value={guest.lastName}
                      onChange={setGuestField('lastName')}
                      placeholder="Last Name"
                      className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                    <input
                      required
                      type="email"
                      value={guest.email}
                      onChange={setGuestField('email')}
                      placeholder="Email"
                      className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                    <input
                      value={guest.phone}
                      onChange={setGuestField('phone')}
                      placeholder="Phone Number"
                      className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                  </div>
                </section>
              )}

              <section className="rounded-3xl border-2 border-carissma-300 bg-white p-6">
                <StickerHeading as="h2" className="text-lg">
                  Delivery Address
                </StickerHeading>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                      Governorate <span className="text-carnation-500">*</span>
                    </span>
                    <select
                      required
                      value={address.governorate}
                      onChange={setAddressField('governorate')}
                      className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    >
                      {GOVERNORATES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                      Area <span className="text-carnation-500">*</span>
                    </span>
                    <select
                      required
                      value={address.area}
                      onChange={setAddressField('area')}
                      className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    >
                      <option value="">Select Area</option>
                      {(KUWAIT_AREAS[address.governorate] || []).map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                        Block <span className="text-carnation-500">*</span>
                      </span>
                      <input
                        required
                        value={address.block}
                        onChange={setAddressField('block')}
                        placeholder="Enter Block"
                        className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                        Street <span className="text-carnation-500">*</span>
                      </span>
                      <input
                        required
                        value={address.street}
                        onChange={setAddressField('street')}
                        placeholder="Enter Street"
                        className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-espresso-900">
                      Build Number <span className="text-carnation-500">*</span>
                    </span>
                    <input
                      required
                      value={address.buildingNumber}
                      onChange={setAddressField('buildingNumber')}
                      placeholder="Build Number"
                      className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-espresso-900">More Details</span>
                    <textarea
                      value={address.moreDetails}
                      onChange={setAddressField('moreDetails')}
                      placeholder="More Details"
                      rows={3}
                      className="w-full rounded-xl border border-carissma-200 bg-linen-50 px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-carissma-100 bg-white/70 p-6">
                <h2 className="text-sm font-bold text-espresso-900">Payment Method</h2>
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
                        {m.label}
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
                My Order
              </StickerHeading>

              <div className="mt-4 space-y-3">
                {items.map((it) => {
                  const attrs = it.variantAttrs || {};
                  const colorKey = Object.keys(attrs).find((k) => k.toLowerCase() === 'color');
                  const otherAttrs = Object.entries(attrs).filter(([k]) => k !== colorKey);
                  return (
                    <div
                      key={`${it.productId}-${it.variantId ?? 'base'}`}
                      className="flex items-center gap-3 rounded-2xl bg-white p-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-linen-100">
                        {it.image ? (
                          <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-espresso-300">No image</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-carissma-500">{it.name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-espresso-700">
                          {colorKey && (
                            <span className="flex items-center gap-1.5">
                              Color:
                              <span
                                className="inline-block h-3 w-3 rounded-full border border-espresso-200"
                                style={{ backgroundColor: attrs[colorKey] }}
                              />
                            </span>
                          )}
                          {otherAttrs.map(([k, v]) => (
                            <span key={k}>
                              {k[0].toUpperCase()}: <span className="font-bold">{v}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="text-sm font-bold text-espresso-900">
                          Qty: <span className="text-carissma-500">{it.quantity}</span>
                        </p>
                        <p className="mt-1 text-sm font-bold text-espresso-900">
                          {(Number(it.price) * it.quantity).toFixed(0)} {it.currency}
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
                  placeholder="Discount Code"
                  className="w-full rounded-xl border border-carissma-100 bg-linen-50 px-4 py-2 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                />
                <button
                  type="button"
                  onClick={onApplyDiscount}
                  disabled={applyingDiscount}
                  className="shrink-0 rounded-xl bg-carissma-400 px-5 text-sm font-bold text-white hover:bg-carissma-500 disabled:opacity-60"
                >
                  {applyingDiscount ? '…' : 'Apply'}
                </button>
              </div>
              {discountError && <p className="mt-1.5 text-xs font-semibold text-carnation-600">{discountError}</p>}
              {discount && (
                <p className="mt-1.5 text-xs font-semibold text-carissma-600">
                  Coupon "{discount.code}" applied — {discountTotal.toFixed(3)} {currency} off.
                </p>
              )}

              <div className="mt-4 space-y-2 border-t border-carissma-200 pt-4 text-sm">
                <div className="flex justify-between font-bold text-espresso-900">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(0)} {currency}</span>
                </div>
                <div className="flex justify-between font-bold text-carnation-500">
                  <span>Discount</span>
                  <span>-{discountTotal.toFixed(3)} {currency}</span>
                </div>
                <div className="flex justify-between font-bold text-espresso-900">
                  <span>Delivery Fees</span>
                  <span>{deliveryFee.toFixed(3)} {currency}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between border-t border-carissma-200 pt-3 text-base font-extrabold text-espresso-900">
                <span>Total</span>
                <span>{grandTotal.toFixed(3)} {currency}</span>
              </div>

              {error && <p className="mt-4 text-sm font-semibold text-carnation-600">{error}</p>}

              <Button type="submit" loading={submitting} disabled={!isFormValid} className="mt-6">
                Place Order
              </Button>
            </div>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
