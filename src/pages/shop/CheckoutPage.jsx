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
        discountCode: discountCode || undefined,
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

            <div className="h-fit rounded-2xl border border-carissma-100 bg-white/70 p-6">
              <div className="space-y-2 text-sm">
                {items.map((it) => (
                  <div key={`${it.productId}-${it.variantId ?? 'base'}`} className="flex justify-between text-espresso-700">
                    <span className="truncate pe-2">
                      {it.name} × {it.quantity}
                    </span>
                    <span className="shrink-0 font-semibold">
                      {(Number(it.price) * it.quantity).toFixed(3)} {it.currency}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-carissma-100 pt-4 text-base font-bold text-espresso-900">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(3)} {currency}</span>
              </div>
              <p className="mt-1 text-xs text-espresso-500">Delivery and any discount are confirmed after you place your order.</p>

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
