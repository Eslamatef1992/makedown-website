import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { checkoutRequest } from '../../api/content.api';
import { CloseIcon } from '../../components/ui/icons';

const GOVERNORATES = ['Al Asimah', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra'];
const PAYMENT_METHODS = [
  { value: 'knet', label: 'KNET' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash On Delivery' },
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
  const discountCode = location.state?.discountCode || '';
  const [discountInput, setDiscountInput] = useState(discountCode);
  const [discountApplied, setDiscountApplied] = useState(Boolean(discountCode));

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

  const setAddressField = (field) => (e) => setAddress((a) => ({ ...a, [field]: e.target.value }));
  const setGuestField = (field) => (e) => setGuest((g) => ({ ...g, [field]: e.target.value }));

  const isFormValid = useMemo(() => {
    if (!address.governorate || !address.area || !address.block || !address.street || !address.buildingNumber) return false;
    if (!isAuthenticated) {
      if (!guest.firstName || !guest.lastName || !guest.email) return false;
    }
    return true;
  }, [address, guest, isAuthenticated]);

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
        discountCode: discountInput.trim() || undefined,
      };
      if (!isAuthenticated) {
        payload.guestName = `${guest.firstName} ${guest.lastName}`.trim();
        payload.guestEmail = guest.email;
        payload.guestPhone = guest.phone || undefined;
      }
      const order = await checkoutRequest(payload);
      clearCart();
      navigate('/order-placed', { state: { order } });
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

      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
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

              <section className="rounded-2xl border border-carissma-100 bg-white/70 p-6">
                <h2 className="text-sm font-bold text-espresso-900">Delivery Address</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select
                    value={address.governorate}
                    onChange={setAddressField('governorate')}
                    className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <input
                    required
                    value={address.area}
                    onChange={setAddressField('area')}
                    placeholder="Area"
                    className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                  />
                  <input
                    required
                    value={address.block}
                    onChange={setAddressField('block')}
                    placeholder="Block"
                    className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                  />
                  <input
                    required
                    value={address.street}
                    onChange={setAddressField('street')}
                    placeholder="Street"
                    className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                  />
                  <input
                    required
                    value={address.buildingNumber}
                    onChange={setAddressField('buildingNumber')}
                    placeholder="Building Number"
                    className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                  />
                  <input
                    value={address.moreDetails}
                    onChange={setAddressField('moreDetails')}
                    placeholder="More Details (optional)"
                    className="rounded-xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-carissma-100 bg-white/70 p-6">
                <h2 className="text-sm font-bold text-espresso-900">Payment Method</h2>
                <div className="mt-4 space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                        paymentMethod === m.value
                          ? 'border-carissma-400 bg-carissma-50 text-carissma-600'
                          : 'border-carissma-100 text-espresso-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.value}
                        checked={paymentMethod === m.value}
                        onChange={() => setPaymentMethod(m.value)}
                        className="h-4 w-4 accent-carissma-500"
                      />
                      {m.label}
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
                    setDiscountApplied(false);
                  }}
                  placeholder="Discount Code"
                  className="w-full rounded-xl border border-carissma-100 bg-linen-50 px-4 py-2 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                />
                <button
                  type="button"
                  onClick={() => setDiscountApplied(Boolean(discountInput.trim()))}
                  className="shrink-0 rounded-xl bg-carissma-400 px-5 text-sm font-bold text-white hover:bg-carissma-500"
                >
                  Apply
                </button>
              </div>
              {discountApplied && (
                <p className="mt-1.5 text-xs font-semibold text-carissma-600">
                  Code saved — it will be reviewed with your order.
                </p>
              )}

              <div className="mt-4 space-y-2 border-t border-carissma-200 pt-4 text-sm">
                <div className="flex justify-between font-bold text-espresso-900">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(0)} {currency}</span>
                </div>
                <div className="flex justify-between font-bold text-carnation-500">
                  <span>Discount</span>
                  <span>0%</span>
                </div>
                <div className="flex justify-between font-bold text-espresso-900">
                  <span>Delivery Fees</span>
                  <span>0.00 {currency}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between border-t border-carissma-200 pt-3 text-base font-extrabold text-espresso-900">
                <span>Total</span>
                <span>{subtotal.toFixed(0)} {currency}</span>
              </div>

              <p className="mt-2 text-xs text-espresso-500">Delivery fees and any discount are confirmed after you place your order.</p>

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
