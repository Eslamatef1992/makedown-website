import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { listPackages, getCodSettings } from '../../api/content.api';
import { purchasePackage } from '../../api/me.api';
import { pickLang } from '../../utils/bilingual';
import { useCurrency } from '../../context/CurrencyContext';
import knetIcon from '../../assets/payment/knet.svg';
import cardsIcon from '../../assets/payment/cards.svg';
import cashIcon from '../../assets/payment/cash.svg';

export default function PackagePurchasePage() {
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [state, setState] = useState('loading');
  const [codEnabled, setCodEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('knet');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Packages are a digital good (games activate instantly on purchase), so
  // cash only shows up here when a super admin has explicitly turned it on
  // for packages in the admin's Cash On Delivery settings — it's off by
  // default, unlike the shop checkout's physical products.
  const PAYMENT_METHODS = [
    { value: 'knet', label: t('shop.checkout.knet'), icon: knetIcon },
    { value: 'credit_card', label: t('packagePurchase.creditCard'), icon: cardsIcon },
    ...(codEnabled ? [{ value: 'cash', label: t('packagePurchase.cash'), icon: cashIcon }] : []),
  ];

  useEffect(() => {
    listPackages()
      .then((rows) => {
        const found = (rows || []).find((p) => String(p.id) === String(id));
        if (!found) return setState('not-found');
        setPkg(found);
        setState('ready');
      })
      .catch(() => setState('error'));

    getCodSettings()
      .then((data) => setCodEnabled(Boolean(data?.packages)))
      .catch(() => setCodEnabled(false));
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
        state: { order: result.order, userPackage: result.userPackage, packageName: pickLang(pkg, 'name', i18n.language) },
      });
    } catch (err) {
      setError(err?.response?.data?.message || t('common.somethingWentWrong'));
      setSubmitting(false);
    }
  };

  if (state === 'loading') {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
          <p className="text-sm font-semibold text-espresso-500">{t('common.loading')}</p>
        </div>
      </SiteLayout>
    );
  }

  if (state === 'not-found' || state === 'error') {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
          <StickerHeading as="h1" className="text-xl">
            {t('packagePurchase.notFound')}
          </StickerHeading>
          <Link to="/profile?tab=packages" className="mt-6 inline-block font-bold text-carissma-600 hover:underline">
            {t('packagePurchase.backToPackages')}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <StickerHeading as="h1" className="text-2xl">
          {t('packagePurchase.checkout')}
        </StickerHeading>

        <form onSubmit={handlePay} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-carissma-100 bg-white/70 p-6">
              <h2 className="text-sm font-bold text-espresso-900">{t('packagePurchase.paymentMethod')}</h2>
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
                <p className="mt-3 text-xs font-semibold text-espresso-500">{t('packagePurchase.cashNote')}</p>
              )}
            </section>
          </div>

          <div className="h-fit rounded-3xl border-2 border-carissma-300 bg-linen-50 p-6">
            <StickerHeading as="h2" className="text-lg">
              {t('packagePurchase.myOrder')}
            </StickerHeading>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="text-sm font-bold text-carissma-500">{pickLang(pkg, 'name', i18n.language)}</p>
              <p className="mt-1 text-xs font-semibold text-espresso-600">{t('packagePurchase.games', { count: pkg.credits })}</p>
            </div>

            <div className="mt-4 space-y-2 border-t border-carissma-200 pt-4 text-sm">
              <div className="flex justify-between font-bold text-espresso-900">
                <span>{t('packagePurchase.subtotal')}</span>
                <span>{formatPrice(pkg.price)}</span>
              </div>
              <div className="flex justify-between font-bold text-carnation-500">
                <span>{t('packagePurchase.discount')}</span>
                <span>{formatPrice(0)}</span>
              </div>
            </div>

            <div className="mt-3 flex justify-between border-t border-carissma-200 pt-3 text-base font-extrabold text-espresso-900">
              <span>{t('packagePurchase.total')}</span>
              <span>{formatPrice(pkg.price)}</span>
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-carnation-600">{error}</p>}

            <Button type="submit" loading={submitting} className="mt-6">
              {t('packagePurchase.pay')}
            </Button>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
