import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { listPackages } from '../../api/content.api';
import { purchasePackage } from '../../api/me.api';
import knetIcon from '../../assets/payment/knet.svg';
import cardsIcon from '../../assets/payment/cards.svg';
import cashIcon from '../../assets/payment/cash.svg';

const PAYMENT_METHODS = [
  { value: 'knet', label: 'KNET', icon: knetIcon },
  { value: 'credit_card', label: 'Credit Card', icon: cardsIcon },
  { value: 'cash', label: 'Cash', icon: cashIcon },
];

export default function PackagePurchasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [state, setState] = useState('loading');
  const [paymentMethod, setPaymentMethod] = useState('knet');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listPackages()
      .then((rows) => {
        const found = (rows || []).find((p) => String(p.id) === String(id));
        if (!found) return setState('not-found');
        setPkg(found);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [id]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await purchasePackage(pkg.id, { paymentMethod });
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      navigate(`/profile/payment-result?status=success&method=cash`, {
        state: { order: result.order, userPackage: result.userPackage, packageName: pkg.name_en },
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'We could not start this payment. Please try again.');
      setSubmitting(false);
    }
  };

  if (state === 'loading') {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
          <p className="text-sm font-semibold text-espresso-500">Loading…</p>
        </div>
      </SiteLayout>
    );
  }

  if (state === 'not-found' || state === 'error') {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
          <StickerHeading as="h1" className="text-xl">
            Package Not Found
          </StickerHeading>
          <Link to="/profile?tab=packages" className="mt-6 inline-block font-bold text-carissma-600 hover:underline">
            Back to Packages
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <StickerHeading as="h1" className="text-2xl">
          Checkout
        </StickerHeading>

        <form onSubmit={handlePay} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-carissma-100 bg-white/70 p-6">
              <h2 className="text-sm font-bold text-espresso-900">Payment Method</h2>
              <div className="mt-4 space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                      paymentMethod === m.value ? 'border-carissma-400 bg-carissma-50 text-carissma-600' : 'border-carissma-100 text-espresso-700'
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
              {paymentMethod === 'cash' && (
                <p className="mt-3 text-xs font-semibold text-espresso-500">
                  Your games are activated right away — settle the payment in cash to keep your package active.
                </p>
              )}
            </section>
          </div>

          <div className="h-fit rounded-3xl border-2 border-carissma-300 bg-linen-50 p-6">
            <StickerHeading as="h2" className="text-lg">
              My Order
            </StickerHeading>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="text-sm font-bold text-carissma-500">{pkg.name_en}</p>
              <p className="mt-1 text-xs font-semibold text-espresso-600">{pkg.credits} Games</p>
            </div>

            <div className="mt-4 space-y-2 border-t border-carissma-200 pt-4 text-sm">
              <div className="flex justify-between font-bold text-espresso-900">
                <span>Subtotal</span>
                <span>
                  {Number(pkg.price).toFixed(3)} {pkg.currency}
                </span>
              </div>
              <div className="flex justify-between font-bold text-carnation-500">
                <span>Discount</span>
                <span>0.000 {pkg.currency}</span>
              </div>
            </div>

            <div className="mt-3 flex justify-between border-t border-carissma-200 pt-3 text-base font-extrabold text-espresso-900">
              <span>Total</span>
              <span>
                {Number(pkg.price).toFixed(3)} {pkg.currency}
              </span>
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-carnation-600">{error}</p>}

            <Button type="submit" loading={submitting} className="mt-6">
              Pay
            </Button>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
