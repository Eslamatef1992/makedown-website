import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { CheckIcon, CloseIcon } from '../../components/ui/icons';

// Reuses the shop's Order Result failure copy — the messages read identically
// whether it's a shop order or a package purchase that failed to pay.
const FAILURE_KEYS = {
  not_paid: 'shop.orderResult.notPaid',
  status_check_failed: 'shop.orderResult.statusCheckFailed',
  missing_reference: 'shop.orderResult.missingReference',
  order_not_found: 'shop.orderResult.orderNotFound',
};

export default function PaymentResultPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const status = searchParams.get('status');
  const reason = searchParams.get('reason');
  const method = searchParams.get('method') || location.state?.order?.payment_method;
  const isSuccess = status === 'success';
  const packageName = location.state?.packageName;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
          {isSuccess ? (
            <CheckIcon className="h-12 w-12" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-carnation-500">
              <CloseIcon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        <StickerHeading as="h1" className="mt-6 text-2xl">
          {isSuccess ? t('profile.paymentResult.success') : t('profile.paymentResult.failed')}
        </StickerHeading>

        <p className="mt-4 text-espresso-600">
          {isSuccess
            ? method === 'cash'
              ? (packageName
                  ? t('profile.paymentResult.cashNoteWithPackage', { package: packageName })
                  : t('profile.paymentResult.cashNote'))
              : t('profile.paymentResult.successBody')
            : (FAILURE_KEYS[reason] ? t(FAILURE_KEYS[reason]) : t('shop.orderResult.genericFailure'))}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/profile" className="rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500">
            {isSuccess ? t('profile.paymentResult.goToProfile') : t('profile.paymentResult.backToProfile')}
          </Link>
          {!isSuccess && (
            <Link
              to="/profile?tab=packages"
              className="rounded-full border-2 border-carissma-400 px-8 py-3 font-bold text-carissma-500 hover:bg-carissma-50"
            >
              {t('profile.paymentResult.changePaymentMethod')}
            </Link>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
